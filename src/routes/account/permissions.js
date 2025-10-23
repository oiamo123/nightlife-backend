import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Permissions");
});

router.post("/", (req, res) => {
  res.send("Create Permissions");
});

router.delete("/", (req, res) => {
  res.send("Delete Permissions");
});

router.put("/", (req, res) => {
  res.send("Update Permissions");
});

export default router;
