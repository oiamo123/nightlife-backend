import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Notifications");
});

router.post("/", (req, res) => {
  res.send("Create Notifications");
});

router.delete("/", (req, res) => {
  res.send("Delete Notifications");
});

router.put("/", (req, res) => {
  res.send("Update Notifications");
});

export default router;
