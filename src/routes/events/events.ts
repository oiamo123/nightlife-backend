import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const events = await prisma.event.findMany({
    include: {
      location: true,
    },
  });

  res.send(events);
});

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
