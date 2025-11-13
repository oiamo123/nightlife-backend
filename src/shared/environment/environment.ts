import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  AWS_REGION: z.string().min(1, "AWS_REGION is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PUBLIC_KEY: z.string().min(1, "PUBLIC_KEY is requried"),
  PRIVATE_KEY: z.string().min(1, "PRIVATE_KEY is required"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables");
  process.exit(1);
}

export const environment = {
  db: {
    databaseUrl: env.data.DATABASE_URL,
  },
  aws: {
    accessKeyId: env.data.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.data.AWS_SECRET_ACCESS_KEY,
    region: env.data.AWS_REGION,
  },
  keys: {
    public: env.data.PUBLIC_KEY,
    private: env.data.PRIVATE_KEY,
  },
  nodeEnv: env.data.NODE_ENV,
};
