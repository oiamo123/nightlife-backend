import express from "express";
import { authenticate, validate } from "../../../middleware/middleware.ts";
import z from "zod";
import { error, success } from "../../../shared/responses.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";
import prisma from "../../../lib/prisma.ts";
const router = express.Router();

const preferencesSchema = z.object({
  venueTypes: z.array(z.object({ id: z.number() })).optional(),
  eventTypes: z.array(z.object({ id: z.number() })).optional(),
  promotionTypes: z.array(z.object({ id: z.number() })).optional(),
});

router.post(
  "/",
  authenticate({ roles: ["User", "Guest"] }),
  validate({ schema: preferencesSchema, source: "body" }),
  async (req, res) => {
    try {
      const jwt = (req as any).jwt;
      const { venueTypes, eventTypes, promotionTypes } = (req as any)
        .validatedData;

      const v = venueTypes.map((v) => ({
        userId: jwt.userId,
        venueTypeId: v.id,
      }));

      const e = eventTypes.map((e) => ({
        userId: jwt.userId,
        eventTypeId: e.id,
      }));

      const p = promotionTypes.map((p) => ({
        userId: jwt.userId,
        promotionTypeId: p.id,
      }));

      const venuePreferencesQuery = prisma.venueTypePreference.createMany({
        data: v,
      });

      const eventPreferencesQuery = prisma.eventTypePreference.createMany({
        data: e,
      });

      const promotionPreferencesQuery =
        prisma.promotionTypePreference.createMany({
          data: p,
        });

      const preferencesSetQuery = prisma.user.update({
        where: {
          id: jwt.userId,
        },
        data: {
          preferencesSet: true,
        },
      });

      await Promise.all([
        venuePreferencesQuery,
        eventPreferencesQuery,
        promotionPreferencesQuery,
        preferencesSetQuery,
      ]);

      success({
        res,
        data: [],
      });
    } catch (err) {
      console.log(err);

      error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.put("/", (req, res) => {});

export default router;
