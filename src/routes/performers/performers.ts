import express from "express";
import prisma from "../../lib/prisma.ts";
import { error, success } from "../../shared/responses.ts";
import { z } from "zod";
import { query } from "../../shared/validation.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { mapEventToFeedItem } from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";

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
  authenticate({}),
  validate({ schema: singlePerformer, source: "params" }),
  async (req, res) => {
    try {
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

      const performerEventsQuery = prisma.eventPerformer.findMany({
        where: {
          performerId: id,
        },
        include: {
          event: {
            include: {
              eventType: true,
              location: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
      });

      const performerQuery = prisma.performer.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          eventType: true,
          city: {
            include: {
              country: true,
            },
          },
        },
      });

      const [likes, followers, links, performerEvents, performer] =
        await Promise.all([
          likesQuery,
          followersQuery,
          linksQuery,
          performerEventsQuery,
          performerQuery,
        ]);

      if (performer === null) {
        throw new ApiError({
          message: "This item appears to have been moved or deleted.",
        });
      }

      const events = performerEvents.map((performerEvent) =>
        mapEventToFeedItem({ event: performerEvent.event })
      );

      success({
        res,
        data: [{ ...performer, eventDetails: events, likes, followers, links }],
      });
    } catch (err) {
      return error({
        res,
        message:
          err instanceof ApiError ? err.message : "Something went wrong.",
      });
    }
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
