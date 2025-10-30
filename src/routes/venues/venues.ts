import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const venues = await prisma.venue.findMany({
    include: {
      location: true,
    },
  });

  res.send(venues);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const venue = await prisma.venue.findMany({
    where: {
      id: Number(id),
    },
  });

  res.send(venue);
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
