import express from "express";
import prisma from "../../../lib/prisma.ts";
import { error, success } from "../../../shared/responses.ts";
import { authenticate } from "../../../middleware/middleware.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";

const router = express.Router();

router.get("/", authenticate({}), async (req, res) => {
  try {
    const jwt = (req as any).jwt;

    const user = await prisma.user.findFirst({
      where: {
        id: jwt.userId,
      },
      select: {
        email: true,
        profileImage: true,
        verified: true,
        preferencesSet: true,
      },
    });

    if (!user) {
      throw new ApiError({ message: "Something went wrong" });
    }

    success({ res, data: [user] });
  } catch (err) {
    error({
      res,
      message: err instanceof ApiError ? err.message : "Something went wrong.",
    });
  }
});

export default router;
