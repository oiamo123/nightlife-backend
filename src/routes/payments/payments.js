import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Payments");
});

router.post("/", (req, res) => {
  res.send("Create Payments");
});

router.delete("/", (req, res) => {
  res.send("Delete Payments");
});

router.put("/", (req, res) => {
  res.send("Update Payments");
});

export default router;
