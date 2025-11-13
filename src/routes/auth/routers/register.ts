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

const router = express.Router();

const registerSchema = z.object({
  email: body.string(),
  password: body.string(),
});

router.post(
  "/",
  validate({ schema: registerSchema, source: "body" }),
  async (req, res) => {
    try {
      const blah = await prisma.user.findFirst({
        where: {
          email: "goiamo@invenre.com",
        },
      });

      if (blah) {
        await prisma.user.delete({
          where: {
            email: "goiamo@invenre.com",
          },
        });
      }

      const { email, password } = (req as any).validatedData;
      if (!email || !password) {
        throw new Error("You must provide an email and a password");
      }

      const existing = await prisma.user.findFirst({
        where: { email },
      });

      if (existing) {
        throw new Error("This email already exists");
      }

      const passwordHashed = await hashString(password);
      if (passwordHashed === null) {
        throw new Error("Something went wrong");
      }

      const role = await prisma.userRole.findFirst({
        where: {
          userRole: "User",
        },
      });

      if (role === null) {
        throw new Error("Something went wrong");
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

      await prisma.emailTokens.create({
        data: {
          email,
          token,
          expiresAt: DateTime.now().plus({ minutes: 15 }).toUTC(),
        },
      });

      const link = `http://localhost:8080/auth/verify?token=${token}`;

      // await sendEmail({
      //   to: email,
      //   subject: "Verify Your Email",
      //   template: "verify_email",
      //   data: {
      //     email: "goiamo@invenre.com",
      //     verificationLink: `http://localhost:8080/auth/verify?token=${token}`,
      //     year: DateTime.now().year,
      //   },
      // });

      success({ res, data: [link] });
    } catch (err) {
      error({
        res,
        message: err.message ?? "Something went wrong",
      });
    }
  }
);

export default router;
