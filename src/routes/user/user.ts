import express from "express";
import followingRouter from "./following.ts";
import linkedAccountsRouter from "./linked_accounts.ts";
import notificationsRouter from "./notifications.ts";
import permissionsRouter from "./permissions.ts";
import preferencesRouter from "./preferences.ts";
import securityRouter from "./security.ts";
import transactionsRouter from "./transactions.ts";
import { success } from "../../shared/responses.ts";
import { sendEmail } from "../../shared/aws/email.ts";
import { validate } from "../../middleware/middleware.ts";

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
