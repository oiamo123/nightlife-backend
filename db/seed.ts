import { PrismaClient } from "@prisma/client";

// mock data
import locations from "../mock_data/locations/locations.json" with { type: "json" };
import venues from "../mock_data/venues/venues.json" with { type: "json" };
import promotions from "../mock_data/promotions/promotions.json" with { type: "json" };
import events from "../mock_data/events/events.json" with { type: "json" };
import currencyCodes from "../mock_data/meta/currency_code.json" with { type: "json" };
import countries from "../mock_data/meta/country.json" with { type: "json" };
import states from "../mock_data/meta/state.json" with { type: "json" };
import cities from "../mock_data/meta/city.json" with { type: "json" };
import eventCategories from "../mock_data/meta/event_categories.json" with { type: "json" };
import eventTypes from "../mock_data/meta/event_types.json" with { type: "json" };
import promotionCategories from "../mock_data/meta/promotion_categories.json" with { type: "json" }
import promotionTypes from "../mock_data/meta/promotion_types.json" with { type: "json" };
import venueTypes from "../mock_data/meta/venue_types.json" with { type: "json" };

import accounts from "../mock_data/account/account.json" with { type: "json" };
import userPermissions from "../mock_data/account/permissions.json" with { type: "json" }
import permissionsFor from "../mock_data/meta//account/permission_for.json" with { type: "json" }
import permissionType from "../mock_data/meta/account/permission_type.json" with { type: "json" }

const prisma = new PrismaClient();

async function main() {
  for (const val of currencyCodes) {
    await prisma.currencyCode.create({ data: val })
  }

  for (const val of countries) {
    await prisma.country.create({ data: val })
  }

  for (const val of states) {
    await prisma.state.create({ data: val })
  }

  for (const val of cities) {
    await prisma.city.create({ data: val })
  }

  for (const val of locations) {
    await prisma.$executeRaw`
      INSERT INTO "Location" ("id", "lat", "lng", "geom", "zip", "address", "cityId")
      VALUES (${val.id}, ${val.lat}, ${val.lng}, ST_SetSRID(ST_MakePoint(${val.lng}, ${val.lat}), 4326), ${val.zip}, ${val.address}, ${val.cityId});
    `;
  }

  for (const val of eventCategories) {
    await prisma.eventCategory.create({ data: val })
  }

  for (const val of eventTypes) {
    await prisma.eventType.create({ data: val })
  }

  for (const val of venueTypes) {
    await prisma.venueType.create({ data: val })
  }

  for (const val of promotionCategories) {
    await prisma.promotionCategory.create({ data: val })
  }

  for (const val of promotionTypes) {
    await prisma.promotionType.create({ data: val })
  }

  for (const val of venues) {
    await prisma.venue.create({ data: val })
  }

  for (const val of promotions) {
    await prisma.promotion.create({ data: val })
  }

  for (const val of events) {
    await prisma.event.create({ data: val })
  }

  for (const val of accounts) {
    await prisma.account.create({ data: val })
  }

  for (const val of permissionType) {
    await prisma.permissionType.create({ data: val })
  }

  for (const val of permissionsFor) {
    await prisma.permissionFor.create({ data: val })
  }

  for (const val of userPermissions) {
    await prisma.userPermission.create({ data: val })
  }

  console.log("\n\nSeeding complete\n\n")
}

main()
  .catch((e) => {
    console.log(e), process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
