import { z } from "zod";
import express from "express";
import prisma from "../../../lib/prisma.ts";
import { validate } from "../../../middleware/middleware.ts";
import { body } from "../../../shared/validation.ts";
import { error, success } from "../../../shared/responses.ts";
import { DateTime } from "luxon";

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
        throw new Error("Your link is invalid");
      }

      const entry = await prisma.emailTokens.findFirst({
        where: {
          token,
        },
      });

      if (!entry || entry.expiresAt < DateTime.now().toUTC()) {
        throw new Error("Your link is expired");
      }

      await prisma.user.update({
        where: { email: entry.email },
        data: { verified: true },
      });

      await prisma.emailTokens.deleteMany({ where: { email: entry.email } });

      success({ res, data: ["Success"] });
    } catch (err) {
      error({
        res,
        message: err.message,
      });
    }
  }
);

export default router;
