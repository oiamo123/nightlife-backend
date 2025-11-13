import express from "express";
import prisma from "../../../lib/prisma.ts";
import { authenticate } from "../../../middleware/middleware.ts";
import { error, success } from "../../../shared/responses.ts";
import { DateTime } from "luxon";
import { verifyHash } from "../../../utils/utils.ts";
import { signRefreshToken } from "../../../shared/tokens/tokens.ts";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const jwt = (req as any).jwt;
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.split(" ")[1];

    const storedRefreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId: jwt.userId,
      },
    });

    console.log(
      `Found refresh token for: ${jwt.userId}, token: ${storedRefreshToken?.token}`
    );

    if (
      !storedRefreshToken ||
      new DateTime(storedRefreshToken.validUntil) > DateTime.now()
    ) {
      throw new Error("Invalid or expired token");
    }

    const match = await verifyHash(storedRefreshToken.token, refreshToken!);

    if (!match) {
      throw new Error("Invalid token");
    }

    const token = await signRefreshToken({
      role: jwt.role,
      userId: jwt.userId,
    });

    return success({
      res,
      data: [
        {
          refreshToken: token,
        },
      ],
    });
  } catch (err) {
    return error({
      res,
      message: err.error,
      status: 401,
    });
  }
});

export default router;
