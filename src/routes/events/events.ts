import { z } from "zod";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { query } from "../../shared/validation.ts";
import { success, error } from "../../shared/responses.ts";
import {
  mapPerformerToFeedItem,
  mapVenueToFeedItem,
} from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleEvent = z.object({
  id: query.number(),
});

const createEvent = z.object({});

const updateEvent = z.object({});

const deleteEvent = z.object({});

// =======================================================
// Routes
// =======================================================
router.get(
  "/:id",
  authenticate({}),
  validate({ schema: singleEvent, source: "params" }),
  async (req, res) => {
    try {
      const { id } = (req as any).validatedData;

      const likesQuery = prisma.eventLike.count({
        where: {
          eventId: id,
        },
      });

      const eventPerformersQuery = prisma.eventPerformer.findMany({
        where: {
          eventId: id,
        },
        include: {
          performer: {
            include: {
              eventType: true,
              city: {
                include: {
                  country: true,
                },
              },
            },
          },
        },
      });

      const eventQuery = prisma.event.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          eventType: true,
          performers: true,
          venue: {
            include: {
              venueType: true,
              location: {
                include: {
                  city: true,
                },
              },
            },
          },
          location: {
            include: {
              city: {
                include: {
                  state: true,
                },
              },
            },
          },
        },
      });

      const [likes, eventPerformers, event] = await Promise.all([
        likesQuery,
        eventPerformersQuery,
        eventQuery,
      ]);

      if (event == null) {
        throw new ApiError({
          message: "This item doesn't appear to exist",
        });
      }

      const venueFormatted = mapVenueToFeedItem({ venue: event.venue });
      const performersFormatted = eventPerformers.map((eventPerformer) =>
        mapPerformerToFeedItem({ performer: eventPerformer.performer })
      );

      success({
        res,
        data: [
          {
            ...event,
            performerDetails: performersFormatted,
            venueDetails: venueFormatted,
            likes,
          },
        ],
      });
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.post("/", (req, res) => {
  res.send("Create Events");
});

router.delete("/", (req, res) => {
  res.send("Delete Events");
});

router.put("/", (req, res) => {
  res.send("Update Events");
});

export default router;
