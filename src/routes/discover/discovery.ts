import { z } from "zod";
import { query } from "../../shared/validation.ts";
import express from "express";
import prisma from "../../lib/prisma.ts";
import { authenticate, validate } from "../../middleware/middleware.ts";
import { DateTime } from "luxon";
import { parseBounds } from "../../utils/utils.ts";
import { error, success } from "../../shared/responses.ts";
import { Prisma } from "@prisma/client";
import { type FeedItemDTO } from "../../shared/models.ts";
import {
  mapEventToFeedItem,
  mapEventToMarker,
  mapPromotionToFeedItem,
  mapPromotionToMarker,
  mapVenueToFeedItem,
  mapVenueToMarker,
} from "../../shared/mappers.ts";
import { ApiError } from "../../shared/errors/api_error.ts";

const router = express.Router();

// =======================================================
// Validation Schema
// =======================================================
const discoveryFilters = z.object({
  venueIds: query.numberArray().optional(),
  promotionIds: query.numberArray().optional(),
  eventIds: query.numberArray().optional(),
  venueTypes: query.numberArray().optional(),
  hasEvents: query.boolean().optional(),
  hasPromotions: query.boolean().optional(),
  isAccessible: query.boolean().optional(),
  isOutdoors: query.boolean().optional(),
  promotionTypes: query.numberArray().optional(),
  maxPrice: query.number().optional(),
  eventTypes: query.numberArray().optional(),
  startDate: query.date().optional(),
  endDate: query.date().optional(),
  locations: query.numberArray().optional(),
  bounds: query.numberArray().optional(),
  coords: query.numberArray().optional(),
  search: query.string().optional(),
  currentPage: query.number().optional(),
  mapDate: query.date().optional(),
  view: z.enum(["map", "list"]).default("map"),
});

// =======================================================
// "Where" statement creators
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

  return where;
}

// =======================================================
// Fetches results by their specific ID's
// =======================================================
async function fetchDataByIds(
  venueIds: number[],
  promotionIds: number[],
  eventIds: number[]
): Promise<FeedItemDTO[]> {
  const feedItems: FeedItemDTO[] = [];

  const select = {
    id: true,
    image: true,
    location: {
      select: {
        id: true,
        lat: true,
        lng: true,
        address: true,
        cityId: true,
        zip: true,
        city: true,
      },
    },
  };

  // =======================================================
  // Fetch venues
  // =======================================================
  if (venueIds && venueIds.length > 0) {
    const venues = await prisma.venue.findMany({
      where: { id: { in: venueIds } },
      select: {
        name: true,
        ...select,
      },
    });

    venues.forEach((venue) => {
      feedItems.push(mapVenueToFeedItem({ venue }));
    });
  }

  // =======================================================
  // Fetch events
  // =======================================================
  if (eventIds && eventIds.length > 0) {
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: {
        ...select,
        title: true,
        price: true,
        startDate: true,
        venue: true,
        eventType: true,
        performers: {
          select: {
            performer: {
              select: {
                id: true,
                name: true,
                image: true,
                eventType: true,
              },
            },
          },
        },
      },
    });

    events.forEach((event) => {
      feedItems.push(
        mapEventToFeedItem({ event: event, venueName: event.venue.name })
      );
    });
  }

  // =======================================================
  // Fetch promotions
  // =======================================================
  if (promotionIds && promotionIds.length > 0) {
    const promotions = await prisma.promotion.findMany({
      where: { id: { in: promotionIds } },
      select: {
        ...select,
        title: true,
        startDate: true,
        venue: true,
        promotionType: true,
      },
    });

    promotions.forEach((promotion) => {
      feedItems.push(
        mapPromotionToFeedItem({ promotion, venueName: promotion.venue.name })
      );
    });
  }

  return feedItems;
}

async function fetchDiscoveryData(filters: any) {
  const { bounds, coords, view } = filters;

  // =======================================================
  // Ensure necessary data
  // =======================================================
  if (view === "map" && (!bounds || bounds.length !== 4)) {
    throw new ApiError({ message: "Bounds required for map view" });
  } else if (view === "list" && (!coords || coords.length !== 2)) {
    throw new ApiError({ message: "Coords required for list view" });
  }

  // =======================================================
  // Create our where statements
  // =======================================================
  const venuesWhere = createVenueWhere(filters);
  const eventsWhere = createEventWhere(filters);
  const promotionsWhere = createPromotionWhere(filters);

  // =======================================================
  // If it's map, use the bounds
  // If it's list view, use the provided city ids from the filter first
  // If no city id's were provided, then use the coords to find the closest city
  // =======================================================
  const locationsQuery: any = {};
  if (view === "map") {
    const [minLat, maxLat, minLng, maxLng] = parseBounds(bounds);
    locationsQuery.location = {
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
      locationsQuery.location = {
        cityId: { in: filters.locations },
      };
    }
  }

  // =======================================================
  // Check if we have filters
  // =======================================================
  const hasVenueFilters = Object.keys(venuesWhere).length > 0;
  const hasEventFilters = Object.keys(eventsWhere).length > 0;
  const hasPromotionFilters = Object.keys(promotionsWhere).length > 0;
  const noFilters =
    !hasVenueFilters && !hasEventFilters && !hasPromotionFilters;

  const venueQuery: any = {};

  // =======================================================
  // If it's map view, default is just +1 day
  // If it's list view, undefined because we use pagination
  // =======================================================
  let startDate;
  let endDate;

  if (view === "list") {
    startDate = filters.startDate
      ? DateTime.fromJSDate(filters.startDate).toUTC()
      : undefined;
    endDate = filters.endDate
      ? DateTime.fromJSDate(filters.endDate).toUTC()
      : undefined;
  } else {
    if (filters.mapDate) {
      const mapDate = DateTime.fromJSDate(filters.mapDate);

      startDate = mapDate.toUTC();
      endDate = mapDate.plus({ days: 1 }).toUTC();
    } else {
      const today = DateTime.now().toUTC();
      startDate = today;
      endDate = today.plus({ days: 1 });
    }
  }

  const startDateWhere: any = {};
  startDateWhere.gte = startDate ?? undefined;
  startDateWhere.lte = endDate ?? undefined;

  // =======================================================
  // Assign our filters
  // =======================================================
  if (hasVenueFilters) {
    Object.assign(venueQuery, venuesWhere);
  }

  const nestedConditions: any[] = [];

  if (hasEventFilters) {
    nestedConditions.push({
      events: {
        some: {
          ...eventsWhere,
          startDate: startDateWhere,
        },
      },
    });
  }

  if (hasPromotionFilters) {
    nestedConditions.push({
      promotions: {
        some: {
          ...promotionsWhere,
          startDate: startDateWhere,
        },
      },
    });
  }

  // =======================================================
  // Determine if the query is nested or if we just want
  // Venues or promotions or events
  // =======================================================
  if (nestedConditions.length === 1) {
    Object.assign(venueQuery, nestedConditions[0]);
  } else if (nestedConditions.length > 1) {
    venueQuery.OR = nestedConditions;
  }

  // =======================================================
  // Query
  // =======================================================
  const locationSelect: any = {
    select: {
      id: true,
      lat: true,
      lng: true,
      address: true,
      cityId: true,
      zip: true,
      city: true,
    },
  };

  const paginationQuery: any = {};
  if (view == "list") {
    paginationQuery.take = 30;
    paginationQuery.skip = 30 * filters.currentPage;
  }

  const data = await prisma.venue.findMany({
    where: {
      ...venueQuery,
      ...locationsQuery,
    },
    select: {
      id: true,
      name: true,
      image: true,
      venueType: true,
      location: locationSelect,
      events: {
        orderBy: {
          startDate: "asc",
        },
        where: {
          ...eventsWhere,
          startDate: startDateWhere,
        },
        select: {
          id: true,
          image: true,
          title: true,
          price: true,
          startDate: true,
          eventType: true,
          performers: {
            select: {
              performer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  eventType: true,
                },
              },
            },
          },
          location: locationSelect,
        },
      },
      promotions: {
        orderBy: {
          startDate: "asc",
        },
        where: {
          ...promotionsWhere,
          startDate: startDateWhere,
        },
        select: {
          id: true,
          image: true,
          title: true,
          startDate: true,
          promotionType: true,
          location: locationSelect,
        },
      },
    },
    ...paginationQuery,
  });

  // =======================================================
  // Map all of our results to the proper response
  // If there's no filters, just return the events and promos
  // If there's a venues filter and no events or promos, filter is venues first ie "is outdoors"
  // Otherwise, the filter is events / promotions first ie "EDM concerts @ outdoor venues"
  // =======================================================
  let results: any[] = [];

  const mapVenue = view === "map" ? mapVenueToMarker : mapVenueToFeedItem;
  const mapEvent = view === "map" ? mapEventToMarker : mapEventToFeedItem;
  const mapPromotion =
    view === "map" ? mapPromotionToMarker : mapPromotionToFeedItem;

  data.forEach((v) => {
    if (noFilters) {
      // @ts-ignore
      v.events.forEach((e) => {
        results.push(mapEvent({ event: e, venueName: v.name }));
      });

      // @ts-ignore
      v.promotions.forEach((p) => {
        results.push(mapPromotion({ promotion: p, venueName: v.name }));
      });
      return;
    }

    if (hasVenueFilters && !hasEventFilters && !hasPromotionFilters) {
      results.push(mapVenue({ venue: v }));
      return;
    }

    if (hasEventFilters) {
      // @ts-ignore
      v.events.forEach((e) => {
        results.push(mapEvent({ event: e, venueName: v.name }));
      });
    }

    if (hasPromotionFilters) {
      // @ts-ignore
      v.promotions.forEach((p) => {
        results.push(mapPromotion({ promotion: p, venueName: v.name }));
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
  authenticate({}),
  validate({ schema: discoveryFilters, source: "query" }),
  async (req, res) => {
    const filters = (req as any).validatedData;
    const { venueIds, promotionIds, eventIds } = filters;

    try {
      // =======================================================
      // Case 1: Specific IDs provided - fetch directly
      // For when a cluster is clicked on on the map
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
    } catch (err) {
      return error({
        res,
        message: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  }
);

export default router;
