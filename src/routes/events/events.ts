import { z } from "zod";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { validate } from "../../middleware/middleware.ts";
import { query } from "../../shared/validation.ts";
import { success } from "../../shared/responses.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleEvent = z.object({
  id: query.number(),
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
    const { id } = (req as any).validatedData;

    const event = await prisma.event.findMany({
      where: {
        id: Number(id),
      },
      include: {
        eventType: true,
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

    success({ res, data: event });
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
