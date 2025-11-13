import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Following");
});

router.post("/", (req, res) => {
  res.send("Create Following");
});

router.delete("/", (req, res) => {
  res.send("Delete Following");
});

router.put("/", (req, res) => {
  res.send("Update Following");
});

export default router;
