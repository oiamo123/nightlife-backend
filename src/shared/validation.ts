import { z } from "zod";

export const asNumberArray = () =>
  z
    .string()
    .optional()
    .transform((val) => {
      const ids = val
        ?.split(",")
        .map((s) => Number(s))
        .filter((n) => n !== undefined);

      return ids;
    }) as z.ZodType<number[] | undefined>;

export const asStringArray = () =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (typeof val === "string")
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      return val;
    }) as z.ZodType<string[] | undefined>;

export const asString = () => z.coerce.string().optional();

export const asBoolean = () =>
  z
    .string()
    .optional()
    .transform((val) => !!val) as z.ZodType<boolean | undefined>;

export const asNumber = () =>
  z.coerce
    .number()
    .optional()
    .transform((val) => Number(val)) as z.ZodType<Number | undefined>;

export const asDate = () =>
  z.iso
    .datetime({ offset: true })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)) as z.ZodType<
    Date | undefined
  >;
