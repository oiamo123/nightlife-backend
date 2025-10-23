import express from "express";
const router = express.Router();

import venues from "../../../mock_data/venues/venues.json" with { type: "json" };

router.get("/", (req, res) => {
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
