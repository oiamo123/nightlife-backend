import express from "express";
const router = express.Router();

router.get("/search", (req, res) => {
  res.send("Get Payments");
});

export default router;
