import express from "express";
import prisma from "../../lib/prisma.ts";
import { success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { validate } from "../../middleware/middleware.ts";

const router = express.Router();

// =======================================================
// Schemas
// =======================================================
const singlePerformer = z.object({
  id: query.number(),
});

const createPerformer = z.object({});

const updatePerformer = z.object({});

const deletePerformer = z.object({});

router.get(
  "/:id",
  validate({ schema: singlePerformer, source: "params" }),
  async (req, res) => {
    const { id } = (req as any).validatedData;

    const likesQuery = prisma.performerLike.count({
      where: {
        performerId: id,
      },
    });

    const followersQuery = prisma.performerFollower.count({
      where: {
        performerId: id,
      },
    });

    const linksQuery = prisma.performerLink.findMany({
      where: {
        performerId: id,
      },
      include: {
        linkType: true,
      },
    });

    const performerQuery = prisma.performer.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        eventType: true,
        events: {
          include: {
            event: true,
          },
        },
        location: {
          include: {
            city: {
              include: {
                state: true,
              },
            },
          },
        },
      },
    });

    const [likes, followers, performer, links] = await Promise.all([
      likesQuery,
      followersQuery,
      performerQuery,
      linksQuery,
    ]);

    success({ res, data: [{ ...performer, likes, followers, links }] });
  }
);

router.post("/", (req, res) => {
  success({ res, data: ["Create Performers"] });
});

router.delete("/", (req, res) => {
  success({ res, data: ["Delete Performers"] });
});

router.put("/", (req, res) => {
  success({ res, data: ["Update Performers"] });
});

export default router;
