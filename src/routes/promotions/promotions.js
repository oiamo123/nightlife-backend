import express from "express";
const router = express.Router();

import promotions from "../../../mock_data/promotions/promotions.json" with { type: "json" };

router.get("/", (req, res) => {
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
