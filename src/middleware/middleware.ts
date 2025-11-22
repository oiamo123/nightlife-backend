import { ZodType } from "zod";
import { error } from "../shared/responses.ts";
import { type jwtPayload, verifyToken } from "../shared/tokens/tokens.ts";
import { ApiError } from "../shared/errors/api_error.ts";
import prisma from "../lib/prisma.ts";
import { Role } from "../shared/models.ts";
import rateLimit from "express-rate-limit";

export function validate<T extends ZodType>({
  schema,
  source,
}: {
  schema: T;
  source: "body" | "query" | "params";
}) {
  return (req, res, next) => {
    try {
      const data = req[source];

      const result = schema.safeParse(data);

      if (!result.success) {
        return error({
          res,
          errors: result.error.issues.map((issue) => ({
            field: issue.path[0] as string,
            message: issue.message as string,
          })),
          message: "Validation failed",
        });
      } else {
        (req as any).validatedData = result.data;
        next();
      }
    } catch (err: any) {
      console.error(err);

      return error({
        res,
        message: err.error,
      });
    }
  };
}

const processGuest = async ({ req }): Promise<boolean> => {
  const guestId = req.headers["x-guest-id"];
  if (!guestId) {
    return false;
  }

  const user = await prisma.user.findFirst({
    where: {
      uuid: guestId,
    },
  });

  if (!user)
    throw new ApiError({ status: 401, message: "Something went wrong" });

  (req as any).jwt = { userId: user.id, role: "Guest" };
  return true;
};

export function authenticate({ roles }: { roles?: ("User" | "Guest")[] }) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError({
          status: 401,
          message: "Unauthorized",
        });
      }

      const token = authHeader.split(" ")[1];

      const payload = verifyToken(token) as jwtPayload;
      if (payload === null) {
        throw new ApiError({
          status: 401,
          message: "Unauthorized",
        });
      }

      if (roles !== undefined && roles.length > 0) {
        if (!roles.includes(payload.role)) {
          throw new ApiError({
            status: 401,
            message: "Unauthorized",
          });
        }
      }

      (req as any).jwt = payload;
      next();
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
        status: err instanceof ApiError ? err.status : 500,
      });
    }
  };
}

export const rateLimiter = ({
  minutes,
  requests,
}: {
  minutes: 1 | 5 | 10 | 15 | 30 | 60;
  requests: number;
}) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: requests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      return error({
        res,
        status: 429,
        message: "Too many requests. Please try again later.",
      });
    },
  });
