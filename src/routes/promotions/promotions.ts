import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const promotions = await prisma.venue.findMany();

  res.send(promotions);
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
