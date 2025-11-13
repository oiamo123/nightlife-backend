import prisma from "../../lib/prisma.ts";
import { hashString } from "../../utils/utils.ts";
import { environment } from "../environment/environment.ts";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

export type jwtPayload = {
  userId: number;
  role: string;
};

export const signToken = function ({
  duration,
  role,
  userId,
}: {
  duration: string;
  role: string;
  userId: number;
}) {
  const token = jwt.sign(
    {
      userId: userId,
      role: role,
    },
    environment.keys.private,
    { algorithm: "RS256", expiresIn: duration }
  );
  return token;
};

export const verifyToken = function (token: string): jwtPayload | null {
  try {
    const body = jwt.verify(token, environment.keys.public, {
      algorithms: ["RS256"],
    }) as jwtPayload;

    return body;
  } catch (err) {
    return null;
  }
};

export const signRefreshToken = async function ({
  role,
  userId,
}: {
  role: string;
  userId: number;
}) {
  const token = signToken({ duration: "30d", userId, role });
  const hashed = await hashString(token);

  if (!hashed) throw new Error("Failed to hash refresh token");

  await prisma.refreshToken.deleteMany({ where: { userId } });

  await prisma.refreshToken.create({
    data: {
      validUntil: DateTime.now().plus({ days: 30 }).toISO(),
      token: hashed,
      userId,
    },
  });

  return token;
};
