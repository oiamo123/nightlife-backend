import { z } from "zod";

// ===============================
// Body validators (no coercion)
// ===============================
export const body = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  date: () => z.date(),
  stringArray: () => z.array(z.string()),
  numberArray: () => z.array(z.number()),

  // ===============================
  // Passwords
  // ===============================
  password: () =>
    z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /\d/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine((val) => /[!@#$%^&*()_\-+=\[\]{};:",.<>?/\\|]/.test(val), {
        message: "Password must contain at least one special character",
      }),

  // ===============================
  // Emails
  // ===============================
  email: () =>
    z
      .string()
      .refine(
        (val) =>
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/.test(
            val
          ),
        {
          message: "Please enter a valid email",
        }
      ),
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
