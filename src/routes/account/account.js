import express from "express";
import followingRouter from "./following.js";
import linkedAccountsRouter from "./linked_accounts.js";
import notificationsRouter from "./notifications.js";
import permissionsRouter from "./permissions.js";
import preferencesRouter from "./preferences.js";
import securityRouter from "./security.js";
import transactionsRouter from "./transactions.js";

const router = express.Router();

router.use("/following", followingRouter);
router.use("/linked-accounts", linkedAccountsRouter);
router.use("/notifications", notificationsRouter);
router.use("/permissions", permissionsRouter);
router.use("/preferences", preferencesRouter);
router.use("/security", securityRouter);
router.use("/transactions", transactionsRouter);

router.get("/", (req, res) => {
  res.send("Get Account");
});

router.post("/", (req, res) => {
  res.send("Create Account");
});

router.delete("/", (req, res) => {
  res.send("Delete Account");
});

router.put("/", (req, res) => {
  res.send("Update Account");
});

export default router;
