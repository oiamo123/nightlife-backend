import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Transactions");
});

router.post("/", (req, res) => {
  res.send("Create Transactions");
});

router.delete("/", (req, res) => {
  res.send("Delete Transactions");
});

router.put("/", (req, res) => {
  res.send("Update Transactions");
});

export default router;
