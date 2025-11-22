import { z } from "zod";
import express from "express";
import { validate } from "../../../middleware/middleware.ts";
import { body } from "../../../shared/validation.ts";
import { error, success } from "../../../shared/responses.ts";
import prisma from "../../../lib/prisma.ts";
import { verifyHash } from "../../../utils/utils.ts";
import { signRefreshToken, signToken } from "../../../shared/tokens/tokens.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";

const router = express.Router();

const loginSchema = z.object({
  email: body.email(),
  password: body.password(),
});

router.post(
  "/",
  validate({ schema: loginSchema, source: "body" }),
  async (req, res) => {
    try {
      const { email, password } = (req as any).validatedData;

      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user || !user.password) {
        throw new ApiError({
          message: "There isn't an account associated with this email.",
        });
      }

      const match = await verifyHash(user.password, password);

      if (!match) {
        throw new ApiError({ message: "Invalid password" });
      }

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
  }
);

export default router;
