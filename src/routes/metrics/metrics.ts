import express from "express";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { body } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import prisma from "../../lib/prisma.ts";
import { EngagementSource, EngagementType } from "../../shared/models.ts";
import { DateTime } from "luxon";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const metricsSchema = z.object({
  entries: z.array(
    z.object({
      subcategory: z.enum(["event", "promotion", "venue", "performer"]),
      engagementSource: z.enum(["list", "map", "page"]),
      engagementType: z.enum(["click", "dwellTime", "impression"]),
      id: body.number(),
      duration: body.number().optional(),
    })
  ),
});

router.post(
  "/",
  authenticate({}),
  validate({ schema: metricsSchema, source: "body" }),
  async (req, res) => {
    try {
      const jwt = (req as any).jwt;
      const { entries } = (req as any).validatedData;

      const initialData = {
        venue: [],
        performer: [],
        event: [],
        promotion: [],
      };

      const data = entries.reduce((acc, cur) => {
        const { subcategory, id, engagementType, engagementSource, duration } =
          cur;
        const entityKey = `${subcategory}Id`;

        const entry = {
          [entityKey]: id,
          userId: jwt.userId,
          engagementTypeId: EngagementType[engagementType],
          engagementSourceId: EngagementSource[engagementSource],
          duration: duration ?? null,
          date: DateTime.now().toUTC().toISO(),
        };

        acc[subcategory].push(entry);

        return acc;
      }, initialData);

      const venuesQuery = prisma.venueMetric.createMany({
        data: data.venue,
      });

      const performersQuery = prisma.performerMetric.createMany({
        data: data.performer,
      });

      const eventsQuery = prisma.eventMetric.createMany({
        data: data.event,
      });

      const promotionsQuery = prisma.promotionMetric.createMany({
        data: data.promotion,
      });

      await Promise.all([
        venuesQuery,
        performersQuery,
        eventsQuery,
        promotionsQuery,
      ]);

      success({ res, data: [] });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

export default router;
