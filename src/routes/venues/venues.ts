import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import {
  mapEventToFeedItem,
  mapPromotionToFeedItem,
  mapVenueToFeedItem,
} from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import { EngagementType } from "../../shared/models.ts";
import { DateTime } from "luxon";
import {
  getTopScoredItems,
  scoreVenueItems,
} from "../../shared/recommendations/scoring.ts";
import { DecayRate } from "../../shared/constants.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleVenue = z.object({
  id: query.number(),
});

const suggestionSchema = z.object({
  search: query.string(),
});

const popularSchema = z.object({
  coords: query.numberArray(),
  days: query.number().optional(),
});

// =======================================================
// Routes
// =======================================================
router.get(
  "/suggestion",
  authenticate({}),
  validate({ schema: suggestionSchema, source: "query" }),
  async (req, res) => {
    try {
      const { search } = (req as any).validatedData;

      const venues = await prisma.venue
        .findMany({
          where: {
            name: {
              startsWith: search as string,
              mode: "insensitive",
            },
          },
          take: 10,
        })
        .then((results) =>
          results.map((result) => ({
            id: result.id,
            suggestion: result.name,
            type: "venue",
            queryKey: "venueIds",
          }))
        );

      success({
        res,
        data: venues,
      });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.get(
  "/late-night",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const lateNightCutoff = new Date();
      lateNightCutoff.setDate(lateNightCutoff.getDate() + 1);
      lateNightCutoff.setHours(1, 0, 0, 0);

      const currentDayOfWeek = new Date().getDay();

      const venueIds: any = await prisma.$queryRaw`
        SELECT v.id
        FROM "Venue" AS v
        JOIN "VenueHour" AS vh ON vh."venueId" = v."id"
        JOIN "Location" AS l ON l."id" = v."locationId"
        JOIN "VenueType" AS vt ON vt."id" = v."venueTypeId"
        WHERE vh."dayOfWeekId" = ${currentDayOfWeek} 
        AND (
          DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') 
            + vh."openingTime"                        
            + (vh."durationHours" || ' hours')::INTERVAL
          ) >= ${lateNightCutoff} 
        AND ST_DWithin(
          l.geom::geography,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000 
        )
        ORDER BY vh."durationHours" DESC
      `;

      const venues = await prisma.venue.findMany({
        where: {
          id: {
            in: venueIds.map((venueId) => venueId.id),
          },
        },
        include: {
          venueType: true,
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

      return success({
        res,
        data: venues.map((venue) => mapVenueToFeedItem({ venue })),
      });
    } catch (err) {
      console.log(err);

      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.get(
  "/open-now",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const now = new Date();
      const currentDayOfWeek = now.getDay();

      const venueIds: any = await prisma.$queryRaw`
        SELECT v.id
        FROM "Venue" AS v
        JOIN "VenueHour" AS vh ON vh."venueId" = v."id"
        JOIN "Location" AS l ON l."id" = v."locationId"
        JOIN "VenueType" AS vt ON vt."id" = v."venueTypeId"
        WHERE vh."dayOfWeekId" = ${currentDayOfWeek}
        AND vh."openingTime" IS NOT NULL
        AND vh."durationHours" IS NOT NULL
        AND CURRENT_TIME >= vh."openingTime"
        AND CURRENT_TIME <= vh."openingTime" + (vh."durationHours" * INTERVAL '1 hour')
        AND ST_DWithin(
          l.geom::geography,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000 
        )
        ORDER BY v."name" ASC
      `;

      const venues = await prisma.venue.findMany({
        where: {
          id: {
            in: venueIds.map((venueId) => venueId.id),
          },
        },
        include: {
          venueType: true,
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

      return success({
        res,
        data: venues.map((venue) => mapVenueToFeedItem({ venue })),
      });
    } catch (err) {
      console.log(err);

      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Venues -> FOR YOU
// =======================================================
router.get(
  "/for-you",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const jwt = (req as any).jwt;
      const [userLat, userLng] = coords;

      // =======================================================
      // Get all venues within 50 kms
      // =======================================================
      const venueIds: any = await prisma.$queryRaw`
        SELECT v."id" FROM "Venue" v
        JOIN "Location" l ON v."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 300
      `;

      const venues = await prisma.venue.findMany({
        where: {
          id: {
            in: venueIds.map((venueId) => venueId.id),
          },
        },
        include: {
          venueType: true,
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

      // =======================================================
      // Run through scoring system
      // =======================================================
      const recommendations = await scoreVenueItems({
        userId: jwt.userId,
        items: venues.map((venue) => ({
          id: venue.id,
          venueTypeId: venue.venueTypeId,
        })),
      }).then((scores) =>
        getTopScoredItems({ scores, items: venues, topN: 10 })
      );

      success({
        res,
        data: recommendations
          .map((venue) => mapVenueToFeedItem({ venue }))
          .slice(0, 10),
      });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Venues -> POPULAR
// =======================================================
router.get(
  "/popular",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords, days } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      // =======================================================
      // Get popular venues
      // -> join venue metrics / types where metric type == click
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by venue id
      // =======================================================
      const venueIds: any = await prisma.$queryRaw`
        SELECT v."id" FROM "Venue" v
        JOIN "VenueMetric" vm ON vm."venueId" = v."id" 
        JOIN "EngagementType" et ON vm."engagementTypeId" = et."id" 
        JOIN "Location" l ON v."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND vm."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY v."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - vm."date")) / 3600.0
          )
        ) DESC
        LIMIT 10
      `;

      const venues = await prisma.venue.findMany({
        where: {
          id: {
            in: venueIds.map((venue) => venue.id),
          },
        },
        include: {
          venueType: true,
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

      success({
        res,
        data: venues.map((venue) => mapVenueToFeedItem({ venue })).slice(0, 10),
      });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Venues -> FOR YOU
// =======================================================
router.get("/types/for-you", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    const venueTypes = await prisma.venueType.findMany({});

    // =======================================================
    // Run through scoring system
    // =======================================================
    const recommendations = await scoreVenueItems({
      userId: jwt.userId,
      items: venueTypes.map((venueType) => ({
        id: venueType.id,
        venueTypeId: venueType.id,
      })),
    }).then((scores) =>
      getTopScoredItems({ scores, items: venueTypes, topN: 10 })
    );

    success({
      res,
      data: recommendations
        .map((type) => ({
          key: type.id,
          value: type.venueType,
          subcategoryType: "venue",
        }))
        .slice(0, 4),
    });
  } catch (err) {
    return error({
      res: res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

// =======================================================
// Venues -> POPULAR CATEGORIES
// =======================================================
router.get(
  "/types/popular",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords, days } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      // =======================================================
      // Gets the most popular venues
      // -> join venue metrics / types where metric type == click
      // -> join venue types
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by venue type id
      // =======================================================
      const venueTypes: any = await prisma.$queryRaw`
        SELECT vt."id", vt."venueType" FROM "Venue" v
        JOIN "VenueType" vt on vt."id" = v."venueTypeId"
        JOIN "VenueMetric" vm ON vm."venueId" = v."id" 
        JOIN "EngagementType" et ON vm."engagementTypeId" = et."id" 
        JOIN "Location" l ON v."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND vm."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY vt."id" 
        ORDER BY count(*) DESC
        LIMIT 4
      `;

      success({
        res,
        data: venueTypes.map((type) => ({
          key: type.id,
          value: type.venueType,
          subcategoryType: "venue",
        })),
      });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Venues -> BY ID
// =======================================================
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
          venueHours: true,
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
