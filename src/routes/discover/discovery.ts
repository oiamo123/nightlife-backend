import { z } from "zod";
import {
  asBoolean,
  asDate,
  asNumber,
  asNumberArray,
  asString,
} from "../../shared/validation.ts";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { validate } from "../../middleware/middleware.ts";
import { DateTime } from "luxon";
import { parseBounds, success } from "../../utils/utils.ts";
import { Prisma } from "@prisma/client";
import type { FeedItemDTO } from "../../shared/models.ts";
import {
  mapEventToFeedItem,
  mapEventToMarker,
  mapPromotionToFeedItem,
  mapPromotionToMarker,
  mapVenueToFeedItem,
  mapVenueToMarker,
} from "../../shared/mappers.ts";

const router = express.Router();

// =======================================================
// Validation Schema
// =======================================================
const discoveryFilters = z.object({
  venueIds: asNumberArray(),
  promotionIds: asNumberArray(),
  eventIds: asNumberArray(),
  venueTypes: asNumberArray(),
  hasEvents: asBoolean(),
  hasPromotions: asBoolean(),
  isAccessible: asBoolean(),
  isOutdoors: asBoolean(),
  promotionTypes: asNumberArray(),
  maxPrice: asNumber(),
  eventTypes: asNumberArray(),
  startDate: asDate(),
  endDate: asDate(),
  locations: asNumberArray(),
  bounds: asNumberArray(),
  coords: asNumberArray(),
  search: asString(),
  view: z.enum(["map", "list"]).default("map"),
});

// =======================================================
// Helper Functions
// =======================================================
function createVenueWhere(filters: any): Prisma.VenueWhereInput {
  const where: Prisma.VenueWhereInput = {};

  if (filters.venueTypes && filters.venueTypes.length > 0) {
    where.venueTypeId = { in: filters.venueTypes };
  }

  if (filters.hasEvents) {
    where.events = { some: {} };
  }

  if (filters.hasPromotions) {
    where.promotions = { some: {} };
  }

  if (filters.isAccessible) {
    where.isAccessible = filters.isAccessible;
  }

  if (filters.isOutdoors) {
    where.isOutdoor = filters.isOutdoors;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (
    filters.locations &&
    filters.locations.length > 0 &&
    filters.view === "list"
  ) {
    where.location = {
      cityId: { in: filters.locations },
    };
  }

  return where;
}

function createEventWhere(filters: any): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};

  if (filters.eventTypes && filters.eventTypes.length > 0) {
    where.eventTypeId = { in: filters.eventTypes };
  }

  if (filters.maxPrice) {
    where.price = { lte: filters.maxPrice };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { headline: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (
    filters.locations &&
    filters.locations.length > 0 &&
    filters.view === "list"
  ) {
    where.location = {
      cityId: { in: filters.locations },
    };
  }

  return where;
}

function createPromotionWhere(filters: any): Prisma.PromotionWhereInput {
  const where: Prisma.PromotionWhereInput = {};

  if (filters.promotionTypes && filters.promotionTypes.length > 0) {
    where.promotionTypeId = { in: filters.promotionTypes };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { headline: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (
    filters.locations &&
    filters.locations.length > 0 &&
    filters.view === "list"
  ) {
    where.location = {
      cityId: { in: filters.locations },
    };
  }

  return where;
}

async function fetchDataByIds(
  venueIds: number[],
  promotionIds: number[],
  eventIds: number[]
): Promise<FeedItemDTO[]> {
  const feedItems: FeedItemDTO[] = [];
  const select = {
    id: true,
    image: true,
    title: true,
    venue: {
      select: {
        name: true,
      },
    },
    location: {
      select: {
        id: true,
        lat: true,
        lng: true,
        address: true,
        city: true,
      },
    },
  };

  // Fetch venues
  if (venueIds && venueIds.length > 0) {
    const venues = await prisma.venue.findMany({
      where: { id: { in: venueIds } },
      include: {
        location: {
          include: {
            city: true,
          },
        },
        venueType: true,
      },
    });

    venues.forEach((venue) => {
      feedItems.push(mapVenueToFeedItem(venue));
    });
  }

  // Fetch events
  if (eventIds && eventIds.length > 0) {
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: {
        ...select,
        price: true,
        eventType: true,
      },
    });

    events.forEach((event) => {
      feedItems.push(mapEventToFeedItem(event, event.venue));
    });
  }

  // Fetch promotions
  if (promotionIds && promotionIds.length > 0) {
    const promotions = await prisma.promotion.findMany({
      where: { id: { in: promotionIds } },
      select: {
        ...select,
        promotionType: true,
      },
    });

    promotions.forEach((promotion) => {
      feedItems.push(mapPromotionToFeedItem(promotion, promotion.venue));
    });
  }

  return feedItems;
}

async function fetchDiscoveryData(filters: any) {
  const { bounds, coords, view } = filters;

  if (view === "map" && (!bounds || bounds.length !== 4)) {
    throw new Error("Bounds required for map view");
  } else if (view === "list" && (!coords || coords.length !== 2)) {
    throw new Error("Coords required for list view");
  }

  const venuesWhere = createVenueWhere(filters);
  const eventsWhere = createEventWhere(filters);
  const promotionsWhere = createPromotionWhere(filters);

  const hasVenueFilters = Object.keys(venuesWhere).length > 0;
  const hasEventFilters = Object.keys(eventsWhere).length > 0;
  const hasPromotionFilters = Object.keys(promotionsWhere).length > 0;
  const noFilters =
    !hasVenueFilters && !hasEventFilters && !hasPromotionFilters;

  const today = DateTime.now().toUTC();

  const venueQuery: any = {};

  if (view === "map") {
    const [minLat, maxLat, minLng, maxLng] = parseBounds(bounds);
    venueQuery.location = {
      lat: { gte: minLat, lte: maxLat },
      lng: { gte: minLng, lte: maxLng },
    };
  } else {
    const [userLat, userLng] = coords;

    if (!filters.locations && userLat && userLng) {
      const closestCity = await prisma.$queryRaw<any[]>`
        SELECT c.id
        FROM "City" c
        JOIN "Location" l ON l."cityId" = c.id
        ORDER BY l.geom <-> ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geometry
        LIMIT 1
      `;

      if (closestCity.length > 0) {
        filters.locations = [closestCity[0].id];
      }
    }

    if (filters.locations && filters.locations.length > 0) {
      venueQuery.location = {
        cityId: { in: filters.locations },
      };
    }
  }

  // Always apply venue filters if they exist
  if (hasVenueFilters) {
    Object.assign(venueQuery, venuesWhere);
  }

  // Apply event/promotion filters as AND conditions
  const nestedConditions: any[] = [];

  if (hasEventFilters) {
    nestedConditions.push({
      events: {
        some: {
          ...eventsWhere,
          startDate: {
            gte: filters.startDate ?? today.toISO(),
            lte: filters.endDate ?? today.plus({ days: 30 }).toISO(),
          },
        },
      },
    });
  }

  if (hasPromotionFilters) {
    nestedConditions.push({
      promotions: {
        some: {
          ...promotionsWhere,
          startDate: {
            gte: filters.startDate ?? today.toISO(),
            lte: filters.endDate ?? today.plus({ days: 30 }).toISO(),
          },
        },
      },
    });
  }

  if (nestedConditions.length === 1) {
    Object.assign(venueQuery, nestedConditions[0]);
  } else if (nestedConditions.length > 1) {
    venueQuery.OR = nestedConditions;
  }

  const data = await prisma.venue.findMany({
    where: venueQuery,
    select: {
      id: true,
      name: true,
      image: true,
      venueType: true,
      location: true,
      events: {
        where: {
          ...eventsWhere,
          startDate: {
            gte: filters.startDate ?? today.toISO(),
            lte: filters.endDate ?? today.plus({ days: 30 }).toISO(),
          },
        },
        select: {
          id: true,
          image: true,
          title: true,
          price: true,
          startDate: true,
          eventType: true,
        },
      },
      promotions: {
        where: {
          ...promotionsWhere,
          startDate: {
            gte: filters.startDate ?? today.toISO(),
            lte: filters.endDate ?? today.plus({ days: 30 }).toISO(),
          },
        },
        select: {
          id: true,
          image: true,
          title: true,
          startDate: true,
          promotionType: true,
        },
      },
    },
  });

  let results: any[] = [];

  const mapVenue = view === "map" ? mapVenueToMarker : mapVenueToFeedItem;
  const mapEvent = view === "map" ? mapEventToMarker : mapEventToFeedItem;
  const mapPromotion =
    view === "map" ? mapPromotionToMarker : mapPromotionToFeedItem;

  data.forEach((v) => {
    if (noFilters) {
      results.push(mapVenue(v));

      v.events.forEach((e) => {
        results.push(mapEvent(e, v));
      });

      v.promotions.forEach((p) => {
        results.push(mapPromotion(p, v));
      });
      return;
    }

    if (hasVenueFilters) {
      results.push(mapVenue(v));
    }

    if (hasEventFilters || (!hasVenueFilters && !hasPromotionFilters)) {
      v.events.forEach((e) => {
        results.push(mapEvent(e, v));
      });
    }

    if (hasPromotionFilters || (!hasVenueFilters && !hasEventFilters)) {
      v.promotions.forEach((p) => {
        results.push(mapPromotion(p, v));
      });
    }
  });

  return results;
}

// =======================================================
// Main Discovery Route
// =======================================================
router.get(
  "/",
  validate({ schema: discoveryFilters, source: "query" }),
  async (req, res) => {
    const filters = (req as any).validatedData;
    const { venueIds, promotionIds, eventIds } = filters;

    try {
      // =======================================================
      // Case 1: Specific IDs provided - fetch directly
      // =======================================================
      if (
        (venueIds && venueIds.length > 0) ||
        (promotionIds && promotionIds.length > 0) ||
        (eventIds && eventIds.length > 0)
      ) {
        const feedItems = await fetchDataByIds(
          venueIds,
          promotionIds,
          eventIds
        );

        return success({ res, data: feedItems });
      }

      // =======================================================
      // Case 2: Map View or List View
      // =======================================================
      const results = await fetchDiscoveryData(filters);
      return success({
        res,
        data: results,
      });
    } catch (error) {
      console.error("Discovery route error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
