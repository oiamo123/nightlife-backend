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

    const venue = await prisma.venue.findMany({
      where: {
        id: Number(id),
      },
      include: {
        venueType: true,
        events: {
          include: {
            eventType: true,
          },
        },
        promotions: {
          include: {
            promotionType: true,
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

    success({ res, data: venue });
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
