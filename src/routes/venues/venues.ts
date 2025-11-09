import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../utils/utils.ts";
import { z } from "zod";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleVenue = z.object({
  id: z.coerce.number(),
});

const createVenue = z.object({});

const updateVenue = z.object({});

const deleteVenue = z.object({});

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
