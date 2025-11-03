import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../utils/utils.ts";

const router = express.Router();

router.get("/promotion-categories", async (req, res) => {
  const categories = await prisma.promotionCategory.findMany({
    include: {
      promotionTypes: true,
    },
  });

  success({
    res,
    data: categories,
  });
});

router.get("/event-categories", async (req, res) => {
  const categories = await prisma.eventCategory.findMany({
    include: {
      eventTypes: true,
    },
  });

  success({
    res,
    data: categories,
  });
});

router.get("/venue-categories", async (req, res) => {
  const categories = await prisma.venueType.findMany();

  success({
    res,
    data: categories,
  });
});

export default router;
