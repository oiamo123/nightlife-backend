import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { ApiError } from "../../shared/errors/api_error.ts";
import { mapVenueToFeedItem } from "../../shared/mappers.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePromotion = z.object({
  id: query.number(),
});

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

router.post("/", (req, res) => {
  res.send("Create Promo");
});

router.delete("/", (req, res) => {
  res.send("Delete Promo");
});

router.put("/", (req, res) => {
  res.send("Update Promo");
});

export default router;
