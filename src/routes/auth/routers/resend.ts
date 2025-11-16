import { z } from "zod";
import express from "express";
import prisma from "../../../lib/prisma.ts";
import { body } from "../../../shared/validation.ts";
import { error, success } from "../../../shared/responses.ts";
import { validate } from "../../../middleware/middleware.ts";
import { userInfo } from "os";
import { generateToken, hashString } from "../../../utils/utils.ts";
import { EmailTemplates, sendEmail } from "../../../shared/aws/email.ts";
import { DateTime } from "luxon";
import { ApiError } from "../../../shared/errors/api_error.ts";

const router = express.Router();

const registerSchema = z.object({
  email: body.email(),
});

router.post(
  "/",
  validate({ schema: registerSchema, source: "body" }),
  async (req, res) => {
    try {
      const { email } = (req as any).validatedData;

      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) throw new ApiError({ message: "Something went wrong." });

      const existing = await prisma.emailToken.findFirst({
        where: {
          email: email,
        },
      });

      if (!existing) throw new ApiError({ message: "Something went wrong." });

      const now = DateTime.now().toUTC();
      const lastSentAt = DateTime.fromISO(existing.lastSentAt);

      if (existing.resends >= 3 && lastSentAt.plus({ hours: 24 }) > now) {
        throw new ApiError({
          message: "We're unable to resend a verification link at this time.",
        });
      }

      if (lastSentAt.plus({ minutes: 5 }) > now) {
        throw new ApiError({
          message:
            "Please wait 5 minutes before attempting to send another link.",
        });
      }

      const token = generateToken();

      await prisma.emailToken.update({
        where: { email },
        data: {
          token,
          resends: existing.resends + 1,
          lastSentAt: DateTime.now().toUTC().toISO(),
          expiresAt: DateTime.now().plus({ minutes: 15 }).toUTC().toISO(),
        },
      });

      await sendEmail({
        to: email,
        subject: "Verify Your Email",
        template: "verify_email",
        data: {
          email: "goiamo@invenre.com",
          verificationLink: `http://localhost:8080/#/auth/verify?token=${token}`,
          year: DateTime.now().year,
        },
      });

      success({ res, data: [] });
    } catch (err) {
      error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

export default router;
