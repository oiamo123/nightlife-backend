import express from "express";
import prisma from "../../lib/prisma.ts";
import { success, error, parseBounds } from "../../utils/utils.ts";
import { validate } from "../../middleware/middleware.ts";
import { z } from "zod";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const markersSchema = z.object({
  bounds: z.array(z.number()).length(4),
});

const singleVenue = z.object({
  id: z.coerce.number(),
});

const multipleVenues = z.object({
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

const createVenue = z.object({});

const updateVenue = z.object({});

const deleteVenue = z.object({});

// =======================================================
// Venues
// =======================================================
router.get(
  "/",
  validate({ schema: multipleVenues, source: "query" }),
  async (req, res) => {
    const data = req.query;

    if (data.view === "map") {
      const { bounds, types, minPrice, maxPrice, startDate, endDate } = data;
      const [minLat, maxLat, minLng, maxLng] = parseBounds(bounds as string);

      const locations = await prisma.location.findMany({
        where: {
          lat: { gte: minLat, lte: maxLat },
          lng: { gte: minLng, lte: maxLng },
          venues: {
            some: {},
          },
        },
        select: {
          lat: true,
          lng: true,
          venues: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const markers = locations.map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        ids: loc.venues.map((v) => v.id),
        titles: loc.venues.map((v) => v.name),
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

  const venue = await prisma.venue.findMany({
    where: {
      id: Number(id),
    },
  });

  success({ res, data: [venue] });
});

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
