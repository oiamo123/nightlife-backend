import { ZodType } from "zod";
import { error } from "../shared/responses.ts";
import { type jwtPayload, verifyToken } from "../shared/tokens/tokens.ts";

export function validate<T extends ZodType>({
  schema,
  source,
}: {
  schema: T;
  source: "body" | "query" | "params";
}) {
  return (req, res, next) => {
    const data = req[source];

    try {
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

export const authenticate = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error({
      res,
      message: "Missing token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token) as jwtPayload;
    if (payload === null) {
      throw new Error("Invalid or expired token");
    }

    (req as any).jwt = payload;
    next();
  } catch (err) {
    return error({
      res,
      message: "Invalid or expired token",
      status: 401,
    });
  }
};
