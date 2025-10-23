import express from "express";
const router = express.Router();

import events from "../../../mock_data/events/events.json" with { type: "json" };

router.get("/", (req, res) => {
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
