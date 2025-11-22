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
  password: body.password(),
});

router.post(
  "/",
  validate({ schema: registerSchema, source: "body" }),
  async (req, res) => {
    try {
      const { email, password } = (req as any).validatedData;
      if (!email || !password) {
        throw new ApiError({
          message: "You must provide an email and a password",
        });
      }

      const existing = await prisma.user.findFirst({
        where: { email },
      });

      if (existing) {
        throw new ApiError({ message: "This email already exists" });
      }

      const passwordHashed = await hashString(password);
      if (passwordHashed === null) {
        throw new ApiError({ message: "Something went wrong" });
      }

      const role = await prisma.userRole.findFirst({
        where: {
          userRole: "User",
        },
      });

      if (role === null) {
        throw new ApiError({ message: "Something went wrong" });
      }

      await prisma.user.create({
        data: {
          email,
          password: passwordHashed,
          verified: false,
          roleId: role.id,
        },
      });

      const token = generateToken();

      await prisma.emailToken.create({
        data: {
          email,
          token,
          resends: 0,
          lastSentAt: DateTime.now().toUTC().toISO(),
          expiresAt: DateTime.now().plus({ minutes: 15 }).toUTC().toISO(),
        },
      });

      // await sendEmail({
      //   to: email,
      //   subject: "Verify Your Email",
      //   template: "verify_email",
      //   data: {
      //     email: "goiamo@invenre.com",
      //     verificationLink: `http://localhost:8080/#/verify?token=${token}`,
      //     year: DateTime.now().year,
      //   },
      // });

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
