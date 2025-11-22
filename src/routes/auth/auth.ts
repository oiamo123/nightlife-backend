import express from "express";

import guestRouter from "./routers/guest.ts";
import loginRouter from "./routers/login.ts";
import logoutRouter from "./routers/logout.ts";
import meRouter from "./routers/me.ts";
import refreshRouter from "./routers/refresh.ts";
import registerRouter from "./routers/register.ts";
import resendRouter from "./routers/resend.ts";
import verificationRouter from "./routers/verify.ts";

const router = express.Router();

router.use("/guest", guestRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/me", meRouter);
router.use("/refresh", refreshRouter);
router.use("/register", registerRouter);
router.use("/resend", resendRouter);
router.use("/verify", verificationRouter);

export default router;
