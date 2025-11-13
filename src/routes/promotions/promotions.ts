import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { validate } from "../../middleware/middleware.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePromotion = z.object({
  id: query.number(),
});

const createPromotion = z.object({});

const updatePromotion = z.object({});

const deletePromotion = z.object({});

router.get(
  "/:id",
  validate({ schema: singlePromotion, source: "params" }),
  async (req, res) => {
    const { id } = (req as any).validatedData;

    const promotion = await prisma.promotion.findMany({
      where: {
        id: Number(id),
      },
      include: {
        promotionType: true,
        venue: {
          include: {
            venueType: true,
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

    success({ res, data: promotion });
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
