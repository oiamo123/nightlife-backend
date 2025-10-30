import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/promotion-categories", async (req, res) => {
  const categories = await prisma.promotionCategory.findMany({
    include: {
      promotionTypes: true,
    },
  });

  res.send(categories);
});

router.get("/event-categories", async (req, res) => {
  const categories = await prisma.eventCategory.findMany({
    include: {
      eventTypes: true,
    },
  });

  res.send(categories);
});

router.get("/venue-categories", async (req, res) => {
  const categories = await prisma.venueType.findMany();
  res.send(categories);
});

export default router;
