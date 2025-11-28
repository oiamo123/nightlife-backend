import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import {
  mapEventToFeedItem,
  mapPerformerToFeedItem,
} from "../../shared/mappers.ts";
import {
  getTopScoredItems,
  scoreEventItems,
} from "../../shared/recommendations/scoring.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import { EngagementType } from "../../shared/models.ts";
import { DateTime } from "luxon";
import { DecayRate } from "../../shared/constants.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePerformer = z.object({
  id: query.number(),
});

const suggestionSchema = z.object({
  search: query.string(),
  coords: query.numberArray(),
  locations: query.numberArray().optional(),
});

const upcomingSchema = z.object({
  coords: query.numberArray(),
});

router.get(
  "/suggestions",
  authenticate({}),
  validate({ schema: suggestionSchema, source: "query" }),
  async (req, res) => {
    try {
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.get(
  "/upcoming",
  authenticate({}),
  validate({ schema: upcomingSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      // =======================================================
      // Gets popular performers
      // -> join performer metrics / types where metric type == click
      // -> date of click >= start of day
      // -> order by count desc and group by performer type id
      // =======================================================
      const performerIds: any = await prisma.$queryRaw`
        WITH PerformerEngagement AS (
          SELECT 
            p."id",
            COUNT(DISTINCT pf."userId") as follower_count,
            SUM(
              EXP(
                -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
              )
            ) as engagement_score
          FROM "Performer" p
          LEFT JOIN "PerformerFollower" pf ON pf."performerId" = p."id"
          JOIN "PerformerMetric" pm ON pm."performerId" = p."id" 
          JOIN "EngagementType" et ON pm."engagementTypeId" = et."id"
          WHERE et."id" = ${EngagementType.click}
          AND pm."date" >= ${DateTime.now()
            .minus({ days: 7 })
            .toUTC()
            .toJSDate()}
          GROUP BY p."id"
          HAVING COUNT(DISTINCT pf."userId") < 1000
        )
        
        SELECT pe."id", MAX(pe.engagement_score) as engagement_score
        FROM PerformerEngagement pe
        JOIN "EventPerformer" ep ON ep."performerId" = pe."id"
        JOIN "Event" e ON e."id" = ep."eventId"
        JOIN "Location" l ON l."id" = e."locationId"
        WHERE ST_DWithin(
          l.geom::geography,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND e."startDate" >= NOW()
        GROUP BY pe."id"
        ORDER BY engagement_score DESC
        LIMIT 10
      `;

      const performers = await prisma.performer.findMany({
        where: {
          id: {
            in: performerIds.map((event) => event.id),
          },
        },
        include: {
          eventType: true,
          city: true,
        },
      });

      success({
        res,
        data: performers.map((performer) =>
          mapPerformerToFeedItem({ performer })
        ),
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

router.get("/following", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    const performerIds: any = await prisma.$queryRaw`
      SELECT p."id" FROM "Performer" p
      JOIN "PerformerFollower" pf ON pf."performerId" = p."id"
      WHERE pf."userId" = ${jwt.userId}
      ORDER BY RANDOM()
      LIMIT 10
    `;

    const performers = await prisma.performer.findMany({
      where: {
        id: {
          in: performerIds.map((performer) => performer.id),
        },
      },
      include: {
        eventType: true,
        city: {
          include: {
            state: true,
          },
        },
      },
    });

    return success({
      res,
      data: performers.map((performer) =>
        mapPerformerToFeedItem({ performer })
      ),
    });
  } catch (err) {
    console.log(err);
    return error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

router.get("/for-you", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    // =======================================================
    // Gets "for you" performers
    // -> Get the performers the user already follows
    // -> Get a sample of performers that are in the users preferences
    // -> Get a sample of popular performers this week
    // -> Combine the results, run through scoring
    // =======================================================
    const performerIds: any = await prisma.$queryRaw`
        WITH FollowedPerformers AS (
          SELECT "performerId" FROM "PerformerFollower" WHERE "userId" = ${
            jwt.userId
          }
        ),
  
        PreferredPerformers AS (
          SELECT p.id FROM "Performer" p
          WHERE p."eventTypeId" IN (
            SELECT "eventTypeId" FROM "EventTypePreference" WHERE "userId" = ${
              jwt.userId
            }
          )
          AND p.id NOT IN (SELECT "performerId" FROM FollowedPerformers)
          ORDER BY RANDOM()
          LIMIT 150
        ),
        
        PopularPerformers AS (
          SELECT p."id" FROM "Performer" p
          JOIN "PerformerMetric" pm ON pm."performerId" = p."id" 
          JOIN "EngagementType" et ON pm."engagementTypeId" = et."id" 
          WHERE p.id NOT IN (SELECT "performerId" FROM FollowedPerformers)
          AND et."id" = ${EngagementType.click}
          AND pm."date" >= ${DateTime.now()
            .minus({ days: 7 })
            .toUTC()
            .toJSDate()}
          GROUP BY p."id"
          ORDER BY SUM(
            EXP(
              -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
            )
          ) DESC
          LIMIT 100
        )
        
        SELECT id FROM PreferredPerformers
        UNION
        SELECT id FROM PopularPerformers
      `;

    const performers = await prisma.performer.findMany({
      where: {
        id: {
          in: performerIds.map((performer) => performer.id),
        },
      },
      include: {
        eventType: true,
        city: {
          include: {
            state: true,
          },
        },
      },
    });

    // =======================================================
    // Run through scoring system
    // =======================================================
    const recommendations = await scoreEventItems({
      userId: jwt.userId,
      items: performers.map((performer) => ({
        id: performer.id,
        eventTypeId: performer.eventTypeId,
      })),
    }).then((scores) =>
      getTopScoredItems({ scores, items: performers, topN: 10 })
    );

    success({
      res,
      data: recommendations
        .map((performer) =>
          mapPerformerToFeedItem({
            performer,
          })
        )
        .slice(0, 10),
    });
  } catch (err) {
    return error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

router.get("/popular", authenticate({}), async (req, res) => {
  try {
    // =======================================================
    // Gets popular performers
    // -> join performer metrics / types where metric type == click
    // -> date of click >= start of day
    // -> order by count desc and group by performer type id
    // =======================================================
    const performerIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Performer" p
        JOIN "PerformerMetric" pm ON pm."performerId" = p."id" 
        JOIN "EngagementType" et ON pm."engagementTypeId" = et."id" 
        WHERE et."id" = ${EngagementType.click}
        AND pm."date" >= ${DateTime.now().minus({ days: 7 }).toUTC().toJSDate()}
        GROUP BY p."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
          )
        ) DESC
        LIMIT 10
      `;

    const performers = await prisma.performer.findMany({
      where: {
        id: {
          in: performerIds.map((event) => event.id),
        },
      },
      include: {
        eventType: true,
        city: true,
      },
    });

    success({
      res,
      data: performers.map((performer) =>
        mapPerformerToFeedItem({ performer })
      ),
    });
  } catch (err) {
    return error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

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
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

router.get("/types/popular", authenticate({}), async (req, res) => {
  try {
    // =======================================================
    // Gets the most popular performer types
    // -> join event metrics / types where metric type == click
    // -> join event types
    // -> date of click >= start of day
    // -> order by count desc and group by event type id
    // =======================================================
    const eventTypes: any = await prisma.$queryRaw`
        SELECT evt."id", evt."eventType" FROM "Performer" p
        JOIN "EventType" evt on evt."id" = p."eventTypeId"
        JOIN "PerformerMetric" pm ON pm."performerId" = p."id" 
        JOIN "EngagementType" et ON pm."engagementTypeId" = et."id" 
        WHERE et."id" = ${EngagementType.click}
        AND pm."date" >= ${DateTime.now().minus({ days: 1 }).toUTC().toJSDate()}
        GROUP BY evt."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
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
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

router.get(
  "/:id",
  authenticate({}),
  validate({ schema: singlePerformer, source: "params" }),
  async (req, res) => {
    try {
      const { id } = (req as any).validatedData;

      const likesQuery = prisma.performerLike.count({
        where: {
          performerId: id,
        },
      });

      const followersQuery = prisma.performerFollower.count({
        where: {
          performerId: id,
        },
      });

      const linksQuery = prisma.performerLink.findMany({
        where: {
          performerId: id,
        },
        include: {
          linkType: true,
        },
      });

      const performerEventsQuery = prisma.eventPerformer.findMany({
        where: {
          performerId: id,
        },
        include: {
          event: {
            include: {
              eventType: true,
              location: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
      });

      const performerQuery = prisma.performer.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          eventType: true,
          city: {
            include: {
              country: true,
            },
          },
        },
      });

      const [likes, followers, links, performerEvents, performer] =
        await Promise.all([
          likesQuery,
          followersQuery,
          linksQuery,
          performerEventsQuery,
          performerQuery,
        ]);

      if (performer === null) {
        throw new ApiError({
          message: "This item appears to have been moved or deleted.",
        });
      }

      const events = performerEvents.map((performerEvent) =>
        mapEventToFeedItem({ event: performerEvent.event })
      );

      success({
        res,
        data: [{ ...performer, eventDetails: events, likes, followers, links }],
      });
    } catch (err) {
      return error({
        res,
        message:
          err instanceof ApiError ? err.message : "Something went wrong.",
      });
    }
  }
);

export default router;
