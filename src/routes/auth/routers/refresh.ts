import express from "express";
import prisma from "../../../lib/prisma.ts";
import { error, success } from "../../../shared/responses.ts";
import { DateTime } from "luxon";
import { hashString, verifyHash } from "../../../utils/utils.ts";
import {
  signRefreshToken,
  signToken,
  verifyToken,
} from "../../../shared/tokens/tokens.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";
import z from "zod";
import { body } from "../../../shared/validation.ts";
import { validate } from "../../../middleware/middleware.ts";

const router = express.Router();

const refreshSchema = z.object({
  refreshToken: body.string(),
});

router.post(
  "/",
  validate({ schema: refreshSchema, source: "body" }),
  async (req, res) => {
    try {
      const { refreshToken } = (req as any).validatedData;
      const jwt = verifyToken(refreshToken);

      if (jwt === null) {
        throw new ApiError({});
      }

      const storedRefreshToken = await prisma.refreshToken.findFirst({
        where: {
          userId: jwt.userId,
        },
      });

      if (
        !storedRefreshToken ||
        DateTime.fromISO(storedRefreshToken.validUntil).toUTC() <
          DateTime.now().toUTC()
      ) {
        throw new ApiError({});
      }

      const match = await verifyHash(storedRefreshToken.token, refreshToken!);

      if (!match) {
        throw new ApiError({});
      }

      const accessToken = signToken({
        role: "User",
        userId: jwt.userId,
      });

      const newRefreshToken = await signRefreshToken({
        role: jwt.role,
        userId: jwt.userId,
      });

      return success({
        res,
        data: [
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          },
        ],
      });
    } catch (err) {
      return error({
        res,
        message: "Something went wrong",
        status: 500,
      });
    }
  }
);

export default router;
