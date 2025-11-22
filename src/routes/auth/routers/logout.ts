import express from "express";
import { error, success } from "../../../shared/responses.ts";
import { authenticate } from "../../../middleware/middleware.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";
import prisma from "../../../lib/prisma.ts";

const router = express.Router();

// =======================================================
// Routes
// =======================================================
router.get("/", authenticate({ roles: ["User"] }), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    await prisma.refreshToken.deleteMany({
      where: {
        userId: jwt.userId,
      },
    });

    return success({
      res,
      data: [],
    });
  } catch (err) {
    return error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

export default router;
