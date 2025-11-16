import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { validate } from "../../middleware/middleware.ts";
import { mapEventToFeedItem } from "../../shared/mappers.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleVenue = z.object({
  id: query.number(),
});

const createVenue = z.object({});

const updateVenue = z.object({});

const deleteVenue = z.object({});

router.get(
  "/:id",
  validate({ schema: singleVenue, source: "params" }),
  async (req, res) => {
    const { id } = (req as any).validatedData;

    const likesQuery = prisma.venueLike.count({
      where: {
        venueId: id,
      },
    });

    const followersQuery = prisma.venueFollower.count({
      where: {
        venueId: id,
      },
    });

    const linksQuery = prisma.venueLink.findMany({
      where: {
        venueId: id,
      },
    });

    const eventsQuery = prisma.event.findMany({
      where: {
        venueId: id,
      },
      include: {
        performers: {
          include: {
            performer: true,
          },
        },
      },
    });

    const promotionsQuery = prisma.promotion.findMany({
      where: {
        venueId: id,
      },
    });

    const venueQuery = prisma.venue.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        venueType: true,
        musicGenres: {
          include: {
            eventType: true,
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

    const [likes, followers, links, events, promotions, venue] =
      await Promise.all([
        likesQuery,
        followersQuery,
        linksQuery,
        eventsQuery,
        promotionsQuery,
        venueQuery,
      ]);

    success({
      res,
      data: [{ ...venue, events, promotions, followers, likes, links }],
    });
  }
);

router.post("/", (req, res) => {
  success({ res, data: ["Create Venues"] });
});

router.delete("/", (req, res) => {
  success({ res, data: ["Delete Venues"] });
});

router.put("/", (req, res) => {
  success({ res, data: ["Update Venues"] });
});

export default router;
