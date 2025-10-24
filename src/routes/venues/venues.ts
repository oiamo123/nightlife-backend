import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const venues = await prisma.venue.findMany();

  res.send(venues);
});

router.post("/", (req, res) => {
  res.send("Create Venues");
});

router.delete("/", (req, res) => {
  res.send("Delete Venues");
});

router.put("/", (req, res) => {
  res.send("Update Venues");
});

export default router;
