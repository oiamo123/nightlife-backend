import { z } from "zod";
import express from "express";
import { validate } from "../../../middleware/middleware.ts";
import { body } from "../../../shared/validation.ts";
import { error, success } from "../../../shared/responses.ts";
import prisma from "../../../lib/prisma.ts";
import { hashString, verifyHash } from "../../../utils/utils.ts";
import {
  signRefreshToken,
  signToken,
  verifyToken,
} from "../../../shared/tokens/tokens.ts";
import { DateTime } from "luxon";

const router = express.Router();

const loginSchema = z.object({
  email: body.string(),
  password: body.string(),
});

router.post(
  "/",
  validate({ schema: loginSchema, source: "body" }),
  async (req, res) => {
    try {
      const { email, password } = (req as any).validatedData;
      if (!email || !password) {
        throw new Error("You must provide an email and a password");
      }

      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user || !user.password) {
        throw new Error("There isn't an account associated with this email.");
      }

      if (!user.verified) {
        throw new Error("This email address hasn't been verified");
      }

      const match = await verifyHash(user.password, password);

      if (!match) {
        throw new Error("Invalid password");
      }

      const accessToken = signToken({
        duration: "15m",
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
        message: err.message ?? "Something went wrong",
      });
    }
  }
);

export default router;
