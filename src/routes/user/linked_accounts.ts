import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get Linked Accounts");
});

router.post("/", (req, res) => {
  res.send("Create Linked Accounts");
});

router.delete("/", (req, res) => {
  res.send("Delete Linked Accounts");
});

router.put("/", (req, res) => {
  res.send("Update Linked Accounts");
});

export default router;
