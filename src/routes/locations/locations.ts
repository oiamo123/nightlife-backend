import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../utils/utils.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const city = req.query.search as string;

  const cities = await prisma.city.findMany({
    where: {
      city: {
        startsWith: city,
        mode: "insensitive",
      },
    },
    include: {
      state: true,
    },
    take: 5,
  });

  success({ res, data: cities });
});

router.get("/:id", async (req, res) => {});

export default router;
