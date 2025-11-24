import express from "express";
import { error, success } from "../../../shared/responses.ts";
import { z } from "zod";
import { body } from "../../../shared/validation.ts";
import { authenticate, validate } from "../../../middleware/middleware.ts";
import { ApiError } from "../../../shared/errors/api_error.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singleVenue = z.object({
  id: body.number(),
  subcategory: z.enum(["event", "promotion", "venue", "performer"]),
});

router.post(
  "/like",
  authenticate({ roles: ["User", "Guest"] }),
  validate({ schema: singleVenue, source: "body" }),
  async (req, res) => {
    try {
      const { jwt } = (req as any).jwt;

      success({ res, data: [] });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.post(
  "/follow",
  authenticate({ roles: ["User", "Guest"] }),
  validate({ schema: singleVenue, source: "params" }),
  async (req, res) => {
    try {
      success({ res, data: [] });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

router.post(
  "/save",
  authenticate({ roles: ["User", "Guest"] }),
  validate({ schema: singleVenue, source: "params" }),
  async (req, res) => {
    try {
      success({ res, data: [] });
    } catch (err) {
      return error({
        res: res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

export default router;
