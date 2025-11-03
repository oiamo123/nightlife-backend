import { ZodError, ZodType } from "zod";
import { error, failure } from "../utils/utils.ts";

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
        console.log(result.error);

        return failure({
          res,
          validation: result.error.issues.map((issue) => issue.path[0]),
        });
      } else {
        Object.assign(req[source], result.data);
        next();
      }
    } catch (err: any) {
      return error({
        res,
      });
    }
  };
}
