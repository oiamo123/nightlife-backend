import express from "express";
const router = express.Router();

import locations from "../../../mock_data/locations/locations.json" with { type: "json" };

router.get("/", (req, res) => {
  res.send(locations);
});

export default router;
