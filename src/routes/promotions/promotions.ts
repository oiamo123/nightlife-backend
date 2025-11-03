import express from "express";
import prisma from "../../lib/prisma.ts";
import { parseBounds, success } from "../../utils/utils.ts";
import { validate } from "../../middleware/middleware.ts";
import { z } from "zod";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const markersSchema = z.object({
  bounds: z.array(z.number()).length(4),
});

const singlePromotion = z.object({
  id: z.coerce.number(),
});

const multiplePromotions = z.object({
  ids: z.union([z.string(), z.array(z.string())]).optional(),
  startDate: z.iso.datetime({ offset: true }).optional(),
  endDate: z.iso.datetime({ offset: true }).optional(),
  types: z.union([z.string(), z.array(z.string())]).optional(),
  locations: z.union([z.string(), z.array(z.string())]).optional(),
  bounds: z.string().nullable().optional(),
  coords: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  view: z.enum(["map", "list"]).default("map"),
});

const createPromotion = z.object({});

const updatePromotion = z.object({});

const deletePromotion = z.object({});

// =======================================================
// Promotions
// =======================================================
router.get(
  "/",
  validate({ schema: multiplePromotions, source: "query" }),
  async (req, res) => {
    const data = req.query;

    if (data.view === "map") {
      const { bounds, types, minPrice, maxPrice, startDate, endDate } = data;
      const [minLat, maxLat, minLng, maxLng] = parseBounds(bounds as string);

      const locations = await prisma.location.findMany({
        where: {
          lat: { gte: minLat, lte: maxLat },
          lng: { gte: minLng, lte: maxLng },
          promotions: {
            some: {},
          },
        },
        select: {
          lat: true,
          lng: true,
          promotions: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      const markers = locations.map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        ids: loc.promotions.map((p) => p.id),
        titles: loc.promotions.map((p) => p.title),
      }));

      return res.json({ success: true, data: markers });
    } else {
      const {
        coordsString,
        typesString,
        locationsString,
        minPriceString,
        maxPriceString,
        startDateString,
        endDateString,
      } = data;
    }
  }
);

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const promotions = await prisma.promotion.findMany({
    where: {
      id: Number(id),
    },
  });

  success({ res, data: promotions });
});

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
