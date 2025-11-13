import { z } from "zod";

// ===============================
// Body validators (no coercion)
// ===============================
export const body = {
  string: () => z.string().min(1),
  number: () => z.number(),
  boolean: () => z.boolean(),
  date: () => z.date(),
  stringArray: () => z.array(z.string()),
  numberArray: () => z.array(z.number()),
};

export const query = {
  string: () => z.string(),
  number: () => number(),
  boolean: () => boolean(),
  date: () => date(),
  stringArray: () => stringArray(),
  numberArray: () => numberArray(),
};

export const numberArray = () =>
  z.string().transform((val) => {
    const ids = val
      ?.split(",")
      .map((s) => Number(s))
      .filter((n) => n !== undefined);

    return ids;
  });

export const stringArray = () =>
  z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === "string")
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return val;
  });

export const asString = () => z.string();

export const boolean = () => z.string().transform((val) => !!val);

export const number = () => z.coerce.number().transform((val) => Number(val));

export const date = () =>
  z.iso
    .datetime({ offset: true })
    .transform((val) => (val ? new Date(val) : undefined));
