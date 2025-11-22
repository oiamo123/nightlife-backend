import express from "express";
import { error, success } from "../../../shared/responses.ts";
import prisma from "../../../lib/prisma.ts";
import { signRefreshToken, signToken } from "../../../shared/tokens/tokens.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";
import { rateLimiter } from "../../../middleware/middleware.ts";

const router = express.Router();

router.get("/", rateLimiter({ minutes: 60, requests: 3 }), async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        verified: true,
        uuid: crypto.randomUUID(),
        roleId: 1,
      },
    });

    const accessToken = signToken({
      role: "User",
      userId: user.id,
    });

    const refreshToken = await signRefreshToken({
      role: "User",
      userId: user.id,
    });

    success({
      res,
      data: [
        {
          accessToken,
          refreshToken,
        },
      ],
    });
  } catch (err) {
    error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong",
    });
  }
});

export default router;
