import express from "express";
import prisma from "../../lib/prisma.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const id = req.query.id;

  const userPermissions = await prisma.userPermission.findMany({
    where: {
      accountId: Number(id),
    },
  });

  res.send(userPermissions);
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
