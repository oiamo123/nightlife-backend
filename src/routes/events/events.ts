import { z } from "zod";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { validate } from "../../middleware/middleware.ts";
import {
  parseBounds,
  parseCoords,
  parseDate,
  parseNumberArray,
  success,
} from "../../utils/utils.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleEvent = z.object({
  id: z.coerce.number(),
});

const multipleEvents = z.object({
  ids: z.union([z.string(), z.array(z.string())]).optional(),
  maxPrice: z.coerce.number().nullable().optional(),
  startDate: z.iso.datetime({ offset: true }).optional(),
  endDate: z.iso.datetime({ offset: true }).optional(),
  types: z.union([z.string(), z.array(z.string())]).optional(),
  locations: z.union([z.string(), z.array(z.string())]).optional(),
  bounds: z.string().nullable().optional(),
  coords: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  view: z.enum(["map", "list"]).default("map"),
});

const createEvent = z.object({});

const updateEvent = z.object({});

const deleteEvent = z.object({});

// =======================================================
// Routes
// =======================================================
router.get(
  "/:id",
  validate({ schema: singleEvent, source: "params" }),
  async (req, res) => {
    console.log(req.query);

    const id = Number(req.params.id);

    const events = await prisma.event.findMany({
      include: {
        location: true,
      },
      where: {
        id: id,
      },
    });

    res.send(events);
  }
);

router.get(
  "/",
  validate({ schema: multipleEvents, source: "query" }),
  async (req, res) => {
    const data = req.query;

    if (data.view === "map") {
      const {
        bounds,
        types: typesString,
        maxPrice: maxPriceString,
        startDate: startDateString,
        endDate: endDateString,
      } = data;

      const [minLat, maxLat, minLng, maxLng] = parseBounds(bounds as string);

      const types = parseNumberArray((typesString as string)?.split(","));

      const maxPrice =
        maxPriceString === undefined
          ? Number.MAX_SAFE_INTEGER
          : Number(maxPriceString);

      const startDate = parseDate(startDateString as string);
      const endDate = parseDate(endDateString as string);

      const eventTypeFilter =
        types && types.length > 0
          ? {
              eventTypes: { some: { id: { in: types } } },
            }
          : {};

      console.log(startDate);
      console.log(endDate);

      const locations = await prisma.location.findMany({
        where: {
          lat: { gte: minLat, lte: maxLat },
          lng: { gte: minLng, lte: maxLng },
          events: {
            some: {
              startDate: {
                gte: startDate,
                lte: endDate,
              },
              price: { lte: maxPrice ?? Number.POSITIVE_INFINITY },
              ...eventTypeFilter,
            },
          },
        },
        select: {
          lat: true,
          lng: true,
          events: {
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
        ids: loc.events.map((e) => e.id),
        titles: loc.events.map((e) => e.title),
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

      const events = await prisma.event.findMany({
        include: {
          location: true,
        },
      });

      console.log(events);

      success({
        res,
        data: events,
      });
    }
  }
);

router.post("/", (req, res) => {
  res.send("Create Events");
});

router.delete("/", (req, res) => {
  res.send("Delete Events");
});

router.put("/", (req, res) => {
  res.send("Update Events");
});

export default router;
