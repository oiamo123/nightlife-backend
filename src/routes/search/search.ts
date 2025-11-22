import express from "express";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const searchSchema = z.object({
  search: query.string(),
  coords: query.numberArray(),
  locations: query.numberArray().optional(),
});

router.get(
  "/suggestions",
  authenticate({}),
  validate({ schema: searchSchema, source: "query" }),
  async (req, res) => {
    try {
      const { search, coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;
      const locationsQuery: any = {};

      const closestCity = await prisma.$queryRaw<any[]>`
        SELECT c.id
        FROM "City" c
        JOIN "Location" l ON l."cityId" = c.id
        ORDER BY l.geom <-> ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geometry
        LIMIT 1
      `;

      locationsQuery.location = {
        cityId: closestCity,
      };

      // =======================================================
      // Venues
      // =======================================================
      const venueQuery = prisma.venue
        .findMany({
          where: {
            name: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.name,
            type: "venue",
            queryKey: "venueIds",
          }))
        );

      // =======================================================
      // Performers
      // =======================================================
      const performerQuery = prisma.performer
        .findMany({
          where: {
            name: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.name,
            type: "performer",
            queryKey: "performerIds",
          }))
        );

      // =======================================================
      // Events
      // =======================================================
      const eventQuery = prisma.event
        .findMany({
          where: {
            title: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.title,
            type: "event",
            queryKey: "eventIds",
          }))
        );

      // =======================================================
      // Event Types
      // =======================================================
      const eventTypeQuery = prisma.eventType
        .findMany({
          where: {
            eventType: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.eventType,
            type: "eventType",
            queryKey: "eventType",
          }))
        );

      // =======================================================
      // Promotion Types
      // =======================================================
      const promotionTypeQuery = prisma.promotionType
        .findMany({
          where: {
            promotionType: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.promotionType,
            type: "promotionType",
            queryKey: "promotionType",
            queryValue: result.promotionCategoryId,
          }))
        );

      const [venue, performer, event, eventType, promotionType] =
        await Promise.all([
          venueQuery,
          performerQuery,
          eventQuery,
          eventTypeQuery,
          promotionTypeQuery,
        ]);

      success({
        res,
        data: [
          ...venue,
          ...performer,
          ...event,
          ...eventType,
          ...promotionType,
        ],
      });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

export default router;
