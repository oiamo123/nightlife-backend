import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Preferences");
});

router.post("/", (req, res) => {
  res.send("Create Preferences");
});

router.delete("/", (req, res) => {
  res.send("Delete Preferences");
});

router.put("/", (req, res) => {
  res.send("Update Preferences");
});

export default router;
