import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../shared/responses.ts";
import { z } from "zod";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { query } from "../../shared/validation.ts";

const router = express.Router();

const locationsSchema = z.object({
  search: query.string(),
});

const citySchema = z.object({
  lat: query.number(),
  lng: query.number(),
});

router.get(
  "/",
  authenticate({}),
  validate({ schema: locationsSchema, source: "query" }),
  async (req, res) => {
    const { search } = (req as any).validatedData;
    const cities = await prisma.city.findMany({
      where: {
        city: {
          startsWith: search as string,
          mode: "insensitive",
        },
      },
      include: {
        state: true,
      },
      take: 5,
    });

    success({ res, data: cities });
  }
);

router.get(
  "/city",
  validate({ schema: citySchema, source: "query" }),
  async (req, res) => {
    const { lat, lng } = (req as any).validatedData;
    const [city] = (await prisma.$queryRaw`
    SELECT
      id,
      city,
      ST_Distance(
        geom,
        ST_MakePoint(${lng}, ${lat})::geography
      ) AS distance_meters
    FROM "City"
    ORDER BY geom <-> ST_MakePoint(${lng}, ${lat})::geography
    LIMIT 1;
  `) as any[];

    return success({ res, data: city });
  }
);

router.get("/:id", async (req, res) => {});

export default router;
