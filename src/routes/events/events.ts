import { z } from "zod";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { query } from "../../shared/validation.ts";
import { success, error } from "../../shared/responses.ts";
import {
  mapEventToFeedItem,
  mapPerformerToFeedItem,
  mapVenueToFeedItem,
} from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import { EngagementType } from "../../shared/models.ts";
import { DateTime } from "luxon";
import {
  getTopScoredItems,
  scoreEventItems,
} from "../../shared/recommendations/scoring.ts";
import { DecayRate } from "../../shared/constants.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleEvent = z.object({
  id: query.number(),
});

const suggestionSchema = z.object({
  search: query.string(),
  coords: query.numberArray(),
  locations: query.numberArray().optional(),
});

const popularSchema = z.object({
  coords: query.numberArray(),
  locations: query.numberArray().optional(),
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

// =======================================================
// New Events
// =======================================================
router.get(
  "/just-added",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const eventIds: any = await prisma.$queryRaw`
        SELECT e."id" FROM "Event" e
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 10
      `;

      const events = await prisma.event.findMany({
        where: {
          id: {
            in: eventIds.map((event) => event.id),
          },
          createdAt: {
            gte: DateTime.now().toUTC().minus({ hours: 1 }),
          },
        },
        include: {
          eventType: true,
          venue: true,
          location: {
            include: {
              city: true,
            },
          },
        },
      });

      return success({
        res,
        data: events.map((event) =>
          mapEventToFeedItem({ event, venueName: event.venue.name })
        ),
      });
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Events Starting Soon
// =======================================================
router.get(
  "/starting-soon",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const eventIds: any = await prisma.$queryRaw`
        SELECT e."id" FROM "Event" e
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 10
      `;

      const events = await prisma.event.findMany({
        where: {
          id: {
            in: eventIds.map((event) => event.id),
          },
          startDate: {
            gte: DateTime.now().toUTC(),
            lte: DateTime.now().toUTC().plus({ hours: 2 }),
          },
        },
        include: {
          eventType: true,
          venue: true,
          location: {
            include: {
              city: true,
            },
          },
        },
      });

      return success({
        res,
        data: events.map((event) =>
          mapEventToFeedItem({ event, venueName: event.venue.name })
        ),
      });
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Events this weekend
// =======================================================
router.get(
  "/this-weekend",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const eventIds: any = await prisma.$queryRaw`
        SELECT e."id" FROM "Event" e
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND e."startDate" > NOW()
        ORDER BY e."startDate" ASC 
        LIMIT 300
      `;

      const today = DateTime.now().toUTC();
      const nextFriday = today.startOf("week").set({ weekday: 5, hour: 17 });
      const nextSunday = today.startOf("week").set({ weekday: 7 }).endOf("day");

      const events = await prisma.event.findMany({
        where: {
          id: {
            in: eventIds.map((event) => event.id),
          },
          startDate: {
            gte: nextFriday,
            lte: nextSunday,
          },
        },
        include: {
          eventType: true,
          venue: true,
          location: {
            include: {
              city: true,
            },
          },
        },
      });

      return success({
        res,
        data: events.map((event) =>
          mapEventToFeedItem({ event, venueName: event.venue.name })
        ),
      });
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

// =======================================================
// Events For you
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
      // Get all events within 50 kms
      // =======================================================
      const eventIds: any = await prisma.$queryRaw`
        SELECT e."id" FROM "Event" e
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND e."startDate" > NOW()
        ORDER BY e."startDate" ASC 
        LIMIT 300
      `;

      const eventsQuery = prisma.event.findMany({
        where: {
          id: {
            in: eventIds.map((event) => event.id),
          },
        },
        include: {
          venue: true,
          eventType: true,
          performers: {
            include: {
              performer: true,
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

      const [events] = await Promise.all([eventsQuery]);

      // =======================================================
      // Run through scoring system
      // =======================================================
      const recommendations = await scoreEventItems({
        userId: jwt.userId,
        items: events.map((event) => ({
          id: event.id,
          eventTypeId: event.eventTypeId,
        })),
      }).then((scores) =>
        getTopScoredItems({ scores, items: events, topN: 10 })
      );

      success({
        res,
        data: recommendations
          .map((event) =>
            mapEventToFeedItem({
              event,
              venueName: event.venue.name,
            })
          )
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
// Popular Events
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
      // Get popular events
      // -> join event metrics / types where metric type == click
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by event type id
      // =======================================================
      const eventIds: any = await prisma.$queryRaw`
        SELECT e."id" FROM "Event" e
        JOIN "EventMetric" em ON em."eventId" = e."id" 
        JOIN "EngagementType" et ON em."engagementTypeId" = et."id" 
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND em."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY e."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - em."date")) / 3600.0
          )
        ) DESC
        LIMIT 10
      `;

      const events = await prisma.event.findMany({
        where: {
          id: {
            in: eventIds.map((event) => event.id),
          },
        },
        include: {
          eventType: true,
          venue: true,
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
        data: events.map((event) =>
          mapEventToFeedItem({ event, venueName: event.venue.name })
        ),
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
// Event Types For You
// =======================================================
router.get("/types/for-you", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    const eventTypes = await prisma.eventType.findMany({});

    // =======================================================
    // Run through scoring system
    // =======================================================
    const recommendations = await scoreEventItems({
      userId: jwt.userId,
      items: eventTypes.map((eventType) => ({
        id: eventType.id,
        eventTypeId: eventType.id,
      })),
    }).then((scores) =>
      getTopScoredItems({ scores, items: eventTypes, topN: 10 })
    );

    success({
      res,
      data: recommendations
        .map((type) => ({
          key: type.id,
          value: type.eventType,
          subcategoryType: "event",
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
// Popular Event Types
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
      // Gets the most popular event types
      // -> join event metrics / types where metric type == click
      // -> join event types
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by event type id
      // =======================================================
      const eventTypes: any = await prisma.$queryRaw`
        SELECT evt."id", evt."eventType" FROM "Event" e
        JOIN "EventType" evt on evt."id" = e."eventTypeId"
        JOIN "EventMetric" em ON em."eventId" = e."id" 
        JOIN "EngagementType" et ON em."engagementTypeId" = et."id" 
        JOIN "Location" l ON e."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND em."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY evt."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - em."date")) / 3600.0
          )
        ) DESC
        LIMIT 4
      `;

      success({
        res,
        data: eventTypes.map((type) => ({
          key: type.id,
          value: type.eventType,
          subcategoryType: "event",
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
// Event by ID
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

export default router;
