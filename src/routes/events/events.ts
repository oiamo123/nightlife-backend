import { z } from "zod";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { validate } from "../../middleware/middleware.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleEvent = z.object({
  id: z.coerce.number(),
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
