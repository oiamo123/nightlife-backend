import { z } from "zod";
import express from "express";
import prisma from "../../../lib/prisma.ts";
import { validate } from "../../../middleware/middleware.ts";
import { body } from "../../../shared/validation.ts";
import { error, success } from "../../../shared/responses.ts";
import { DateTime } from "luxon";
import { ApiError } from "../../../shared/errors/api_error.ts";

const router = express.Router();

const validateSchema = z.object({
  token: body.string(),
});

router.get(
  "/",
  validate({ schema: validateSchema, source: "query" }),
  async (req, res) => {
    try {
      const { token } = (req as any).validatedData;

      if (!token) {
        throw new ApiError({ message: "Your link is invalid" });
      }

      const entry = await prisma.emailToken.findFirst({
        where: {
          token,
        },
      });

      if (!entry || entry.expiresAt < DateTime.now().toUTC()) {
        throw new ApiError({ message: "Your link is expired" });
      }

      await prisma.user.update({
        where: { email: entry.email },
        data: { verified: true },
      });

      await prisma.emailToken.deleteMany({ where: { email: entry.email } });

      success({ res, data: [] });
    } catch (err) {
      error({
        res,
        message:
          err instanceof ApiError ? err.message : "Something went wrong.",
      });
    }
  }
);

export default router;
