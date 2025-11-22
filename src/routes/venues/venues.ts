import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import {
  mapEventToFeedItem,
  mapPromotionToFeedItem,
} from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleVenue = z.object({
  id: query.number(),
});

router.get(
  "/:id",
  authenticate({}),
  validate({ schema: singleVenue, source: "params" }),
  async (req, res) => {
    try {
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
        include: {
          linkType: true,
        },
      });

      const eventsQuery = prisma.event.findMany({
        where: {
          venueId: id,
        },
        include: {
          eventType: true,
          location: {
            include: {
              city: true,
            },
          },
          performers: {
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
          },
        },
      });

      const promotionsQuery = prisma.promotion.findMany({
        where: {
          venueId: id,
        },
        include: {
          promotionType: true,
          location: {
            include: {
              city: true,
            },
          },
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

      if (venue === null) {
        throw new ApiError({
          message: "This item appears to have been moved or deleted.",
        });
      }

      success({
        res,
        data: [
          {
            ...venue,
            eventDetails: events.map((event) =>
              mapEventToFeedItem({ event: event, venueName: venue.name })
            ),
            promotionDetails: promotions.map((promotion) =>
              mapPromotionToFeedItem({
                promotion: promotion,
                venueName: venue.name,
              })
            ),
            followers,
            likes,
            links,
          },
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
