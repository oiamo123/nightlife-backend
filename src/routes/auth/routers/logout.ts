import { z } from "zod";
import express from "express";
import { query } from "../../../shared/validation.ts";
import { success } from "../../../shared/responses.ts";

const router = express.Router();

const singleEvent = z.object({
  id: query.number(),
});

// =======================================================
// Routes
// =======================================================
router.post("/", async (req, res) => {
  success({ res, data: ["Success"] });
});

router.post("/apple", (req, res) => {
  success({ res, data: ["Success"] });
});

router.post("/google", (req, res) => {
  success({ res, data: ["Success"] });
});

export default router;
