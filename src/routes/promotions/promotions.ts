import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../utils/utils.ts";
import { z } from "zod";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePromotion = z.object({
  id: z.coerce.number(),
});

const createPromotion = z.object({});

const updatePromotion = z.object({});

const deletePromotion = z.object({});

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
