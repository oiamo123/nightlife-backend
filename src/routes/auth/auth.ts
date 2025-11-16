import express from "express";

import loginRouter from "./routers/login.ts";
import logoutRouter from "./routers/logout.ts";
import refreshRouter from "./routers/refresh.ts";
import registerRouter from "./routers/register.ts";
import resendRouter from "./routers/resend.ts";
import verificationRouter from "./routers/verify.ts";

const router = express.Router();

router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/refresh", refreshRouter);
router.use("/register", registerRouter);
router.use("/resend", resendRouter);
router.use("/verify", verificationRouter);

export default router;
