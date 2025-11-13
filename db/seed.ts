import { PrismaClient } from "@prisma/client";

// mock data
import locations from "../mock_data/locations/locations.json" with { type: "json" };
import venues from "../mock_data/venues/venues.json" with { type: "json" };
import promotions from "../mock_data/promotions/promotions.json" with { type: "json" };
import events from "../mock_data/events/events.json" with { type: "json" };
import eventCategories from "../mock_data/meta/event_categories.json" with { type: "json" };
import eventTypes from "../mock_data/meta/event_types.json" with { type: "json" };
import promotionCategories from "../mock_data/meta/promotion_categories.json" with { type: "json" }
import promotionTypes from "../mock_data/meta/promotion_types.json" with { type: "json" };
import venueTypes from "../mock_data/meta/venue_types.json" with { type: "json" };
import permissionsFor from "../mock_data/meta//account/permission_for.json" with { type: "json" }
import permissionType from "../mock_data/meta/account/permission_type.json" with { type: "json" }
import userRoles from "../mock_data/meta/user_roles.json" with { type: "json" }
import countryStateCity from "../mock_data/countries/countries+states+cities.json" with { type: "json" }

const prisma = new PrismaClient();

async function main() {
  for (const country of countryStateCity as any[]) {
    if (country.name === "Canada" || country.name === "United States") {
          const currency = await prisma.currencyCode.create({
      data: {
        currencyCode: country.currency,
        currencySymbol: country.currency_symbol
      }
    })

    for (const timeZone of country.timezones) {
      let tz = await prisma.timeZone.findFirst({
        where: { zoneName: timeZone.zoneName },
      });
    
      if (!tz) {
        await prisma.timeZone.create({
          data: {
            zoneName: timeZone.zoneName,
            gmtOffset: timeZone.gmtOffset,
            gmtOffsetName: timeZone.gmtOffsetName,
            abbreviation: timeZone.abbreviation,
            tzName: timeZone.tzName
          }
        })
      }
    }

    const newCountry = await prisma.country.create({
      data: {
        country: country.name.toLowerCase(),
        iso3: country.iso3,
        currencyCodeId: currency.id
      }
    })

    for (const state of country.states) {
      const newProvince = await prisma.state.create({
        data: {
          state: state.name.toLowerCase(),
          iso2: state.iso2.toLowerCase(),
          countryId: newCountry.id,
        }
      })

      const tz = await prisma.timeZone.findFirst({
        where: { zoneName: state.timezone },
      });

      for (const city of state.cities) {        
        await prisma.$executeRaw`
          INSERT INTO "City" ("city", "geom", "countryId", "stateId", "timeZoneId")
          VALUES (${city.name.toLowerCase()}, ST_SetSRID(ST_MakePoint(${Number(city.latitude)}, ${Number(city.longitude)}), 4326), ${newCountry.id}, ${newProvince.id}, ${tz?.id ?? 0});
        `;
      }
    }
    }
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
    await prisma.venue.create({ 
      data: { 
        ...val, 
        musicGenres: {
          connect: val.musicGenres.map((musicGenre: number) => ({ id: musicGenre }))
        }
      } 
    })
  }

  for (const val of promotions) {
    await prisma.promotion.create({ 
      data: { 
        ...val, 
      } 
    })
  }

  for (const val of events) {
    await prisma.event.create({ 
      data: { 
        ...val, 
      } 
    })
  }

  for (const val of permissionType) {
    await prisma.permissionType.create({ data: val })
  }

  for (const val of permissionsFor) {
    await prisma.permissionFor.create({ data: val })
  }

  for (const val of userRoles) {
    await prisma.userRole.create({ data: val })
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
