import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import {
  mapPromotionToFeedItem,
  mapVenueToFeedItem,
} from "../../shared/mappers.ts";
import { EngagementType } from "../../shared/models.ts";
import { DateTime } from "luxon";
import {
  getTopScoredItems,
  scorePromotionItem,
} from "../../shared/recommendations/scoring.ts";
import { DecayRate } from "../../shared/constants.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePromotion = z.object({
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
// New Promotions
// =======================================================
router.get(
  "/just-added",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const promotionIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Promotion" p
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 10
      `;

      const promotions = await prisma.promotion.findMany({
        where: {
          id: {
            in: promotionIds.map((promotion) => promotion.id),
          },
          createdAt: {
            gte: DateTime.now().toUTC().minus({ hours: 1 }),
          },
        },
        include: {
          promotionType: true,
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
        data: promotions.map((promotion) =>
          mapPromotionToFeedItem({ promotion, venueName: promotion.venue.name })
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
// Promotions starting soon
// =======================================================
router.get(
  "/starting-soon",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const promotionIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Promotion" p
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 10
      `;

      const promotions = await prisma.promotion.findMany({
        where: {
          id: {
            in: promotionIds.map((promotion) => promotion.id),
          },
          startDate: {
            gte: DateTime.now().toUTC(),
            lte: DateTime.now().plus({ hours: 2 }).toUTC(),
          },
        },
        include: {
          promotionType: true,
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
        data: promotions.map((promotion) =>
          mapPromotionToFeedItem({ promotion, venueName: promotion.venue.name })
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
// Promotions this weekend
// =======================================================
router.get(
  "/this-weekend",
  authenticate({}),
  validate({ schema: popularSchema, source: "query" }),
  async (req, res) => {
    try {
      const { coords } = (req as any).validatedData;
      const [userLat, userLng] = coords;

      const promotionIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Promotion" p
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        LIMIT 10
      `;

      const today = DateTime.now().toUTC();
      const nextFriday = today.startOf("week").set({ weekday: 5, hour: 17 });
      const nextSunday = today.startOf("week").set({ weekday: 7 }).endOf("day");

      const promotions = await prisma.promotion.findMany({
        where: {
          id: {
            in: promotionIds.map((promotion) => promotion.id),
          },
          startDate: {
            gte: nextFriday,
            lte: nextSunday,
          },
        },
        include: {
          promotionType: true,
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
        data: promotions.map((promotion) =>
          mapPromotionToFeedItem({ promotion, venueName: promotion.venue.name })
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
// Promotions "For You"
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
      const promotionIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Promotion" p
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND p."startDate" > NOW()
        ORDER BY p."startDate" ASC 
        LIMIT 300
      `;

      const promotionQuery = prisma.promotion.findMany({
        where: {
          id: {
            in: promotionIds.map((performer) => performer.id),
          },
        },
        include: {
          venue: true,
          promotionType: true,
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

      const [promotions] = await Promise.all([promotionQuery]);

      // =======================================================
      // Run through scoring system
      // =======================================================
      const recommendations = await scorePromotionItem({
        userId: jwt.userId,
        items: promotions.map((promotion) => ({
          id: promotion.id,
          promotionTypeId: promotion.promotionTypeId,
        })),
      }).then((scores) =>
        getTopScoredItems({ scores, items: promotions, topN: 10 })
      );

      success({
        res,
        data: recommendations
          .map((promotion) =>
            mapPromotionToFeedItem({
              promotion,
              venueName: promotion.venue.name,
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
// Popular Promotions
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
      // Get popular promotions
      // -> join promotion metrics / types where metric type == click
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by promotion type id
      // =======================================================
      const promotionIds: any = await prisma.$queryRaw`
        SELECT p."id" FROM "Promotion" p
        JOIN "PromotionMetric" pm ON pm."promotionId" = p."id" 
        JOIN "EngagementType" et ON pm."engagementTypeId" = et."id" 
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND pm."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY p."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
          )
        ) DESC
        LIMIT 10
      `;

      const promotionsQuery = prisma.promotion.findMany({
        where: {
          id: {
            in: promotionIds.map((promotion) => promotion.id),
          },
        },
        include: {
          promotionType: true,
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

      const [promotions] = await Promise.all([promotionsQuery]);

      success({
        res,
        data: promotions.map((promotion) =>
          mapPromotionToFeedItem({ promotion, venueName: promotion.venue.name })
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
// Promotions Categories For You
// =======================================================
router.get("/types/for-you", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    const promotionTypes = await prisma.promotionType.findMany({});

    // =======================================================
    // Run through scoring system
    // =======================================================
    const recommendations = await scorePromotionItem({
      userId: jwt.userId,
      items: promotionTypes.map((promotionType) => ({
        id: promotionType.id,
        promotionTypeId: promotionType.id,
      })),
    }).then((scores) =>
      getTopScoredItems({ scores, items: promotionTypes, topN: 10 })
    );

    success({
      res,
      data: recommendations
        .map((type) => ({
          key: type.id,
          value: type.promotionType,
          subcategoryType: "promotion",
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
// Popular Promotions
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
      // Gets the most popular promotion types
      // -> join promotion metrics / types where metric type == click
      // -> join promotion types
      // -> join location where location within 50km
      // -> date of click >= start of day
      // -> order by count desc and group by promotion type id
      // =======================================================
      const promotionTypes: any = await prisma.$queryRaw`
        SELECT pt."id", pt."promotionType" FROM "Promotion" p
        JOIN "PromotionType" pt on pt."id" = p."promotionTypeId"
        JOIN "PromotionMetric" pm ON pm."promotionId" = p."id" 
        JOIN "EngagementType" et ON pm."engagementTypeId" = et."id" 
        JOIN "Location" l ON p."locationId" = l."id"
        WHERE ST_DWithin(
          l.geom,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          50000
        )
        AND et."id" = ${EngagementType.click}
        AND pm."date" >= ${DateTime.now()
          .minus({ days: days ?? 1 })
          .toUTC()
          .toJSDate()}
        GROUP BY pt."id" 
        ORDER BY SUM(
          EXP(
            -${DecayRate} * EXTRACT(EPOCH FROM (NOW() - pm."date")) / 3600.0
          )
        ) DESC
        LIMIT 4
      `;

      success({
        res,
        data: promotionTypes.map((type) => ({
          key: type.id,
          value: type.promotionType,
          subcategoryType: "promotion",
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
// Promotion by ID
// =======================================================
router.get(
  "/:id",
  authenticate({}),
  validate({ schema: singlePromotion, source: "params" }),
  async (req, res) => {
    try {
      const { id } = (req as any).validatedData;

      const likeQuery = prisma.promotionLike.count({
        where: {
          promotionId: id,
        },
      });

      const promotionQuery = prisma.promotion.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          promotionType: true,
          venue: {
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

      const [likes, promotion] = await Promise.all([likeQuery, promotionQuery]);

      if (promotion === null) {
        throw new ApiError({
          message: "This item appears to have moved or been deleted",
        });
      }

      const venueFormatted = mapVenueToFeedItem({ venue: promotion.venue });

      success({
        res,
        data: [{ ...promotion, venueDetails: venueFormatted, likes }],
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
