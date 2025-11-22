import express from "express";
import notificationsRouter from "./routers/notifications.ts";
import permissionsRouter from "./routers/permissions.ts";
import preferencesRouter from "./routers/preferences.ts";
import securityRouter from "./routers/security.ts";
import socialRouter from "./routers/social.ts";
import transactionsRouter from "./routers/transactions.ts";

const router = express.Router();

router.use("/notifications", notificationsRouter);
router.use("/permissions", permissionsRouter);
router.use("/preferences", preferencesRouter);
router.use("/security", securityRouter);
router.use("/social", socialRouter);
router.use("/transactions", transactionsRouter);

export default router;
