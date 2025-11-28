import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon"

// mock data
import locations from "../mock_data/locations/locations.json" with { type: "json" };
import users from "../mock_data/users/users.json" with { type: "json" }
import venues from "../mock_data/venues/venues.json" with { type: "json" };
import promotions from "../mock_data/promotions/promotions.json" with { type: "json" };
import events from "../mock_data/events/events.json" with { type: "json" };
import performers from "../mock_data/performers/performers.json" with { type: "json" };
import eventPerformers from "../mock_data/performers/event_performers.json" with { type: "json" };
import eventCategories from "../mock_data/meta/event_categories.json" with { type: "json" };
import eventTypes from "../mock_data/meta/event_types.json" with { type: "json" };
import promotionCategories from "../mock_data/meta/promotion_categories.json" with { type: "json" }
import promotionTypes from "../mock_data/meta/promotion_types.json" with { type: "json" };
import venueTypes from "../mock_data/meta/venue_types.json" with { type: "json" };
import musicGenres from "../mock_data/venues/music_genres.json" with { type: "json" };
import userRoles from "../mock_data/meta/user_roles.json" with { type: "json" }
import countryStateCity from "../mock_data/countries/countries+states+cities.json" with { type: "json" }
import linkTypes from "../mock_data/meta/link_type.json" with { type: "json" }
import venueFollowers from "../mock_data/venues/venue_followers.json" with { type: "json" }
import venueLikes from "../mock_data/venues/venue_likes.json" with { type: "json" }
import venueLinks from "../mock_data/venues/venue_links.json" with { type: "json" }
import venuePreferences from "../mock_data/venues/venue_preferences.json" with { type: "json" }
import performerFollowers from "../mock_data/performers/performer_followers.json" with { type: "json" }
import performerLikes from "../mock_data/performers/performer_likes.json" with { type: "json" }
import performerLinks from "../mock_data/performers/performer_links.json" with { type: "json" }
import eventLikes from "../mock_data/events/event_likes.json" with { type: "json" }
import eventPreferences from "../mock_data/events/event_preferences.json" with { type: "json" }
import promotionLikes from "../mock_data/promotions/promotion_likes.json" with { type: "json" }
import promotionPreferences from "../mock_data/promotions/promotion_preferences.json" with { type: "json" }
import engagementType from "../mock_data/metrics/engagementType.json" with { type: "json" }
import engagementSource from "../mock_data/metrics/engagementSource.json" with { type: "json" }
import venueHours from "../mock_data/venues/venue_hours.json" with { type: "json" };
import daysOfWeek from "../mock_data/meta/day_of_week.json" with { type: "json" }

const prisma = new PrismaClient();

let today = DateTime.now().toUTC()
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
      } 
    })
  }

  for (const val of daysOfWeek) {
    await prisma.dayOfWeek.create({
      data: {
        ...val
      }
    })
  }

  for (const val of venueHours) {
    await prisma.venueHour.create({
      data: {
        ...val
      }
    })
  }

  for (const val of musicGenres) {
    await prisma.musicGenre.create({ data: val })
  }

  for (const val of promotions) {
    await prisma.promotion.create({ 
      data: { 
        ...val, 
        startDate: today.toISO(),
        endDate: today.toISO()
      } 
    })
    today = today.plus({ days: 1 })
  }

  for (const val of performers) {
    await prisma.performer.create({
      data: {
        ...val
      }
    })
  }

  for (const val of events) {
    await prisma.event.create({ 
      data: { 
        ...val, 
        startDate: today.toISO(),
        endDate: today.toISO()
      } 
    })

    const eventPerformerData = eventPerformers.filter((performer) => performer.eventId === val.id)
    for (const val of eventPerformerData) {
      await prisma.eventPerformer.create({
        data: {
          ...val,
          startDate: today.toISO(),
          endDate: today.toISO()
        }
      })
    }

    today = today.plus({ days: 1 })
  }

  for (const val of userRoles) {
    await prisma.userRole.create({ data: val })
  }

  for (const val of users) {
    await prisma.user.create({
      data: {
        ...val
      }
    })
  }

  for (const val of linkTypes) {
    await prisma.linkType.create({
      data: {
        ...val
      }
    })
  }

  for (const val of venueFollowers) {
    await prisma.venueFollower.create({
      data: {
        ...val
      }
    })
  }

  for (const val of venueLikes) {
    await prisma.venueLike.create({
      data: {
        ...val
      }
    })
  }

  for (const val of venueLinks) {
    await prisma.venueLink.create({
      data: {
        ...val
      }
    })
  }

  for (const val of venuePreferences) {
    await prisma.venueTypePreference.create({
      data: {
        ...val
      }
    })
  }

  for (const val of performerFollowers) {
    await prisma.performerFollower.create({
      data: {
        ...val
      }
    })
  }

  for (const val of performerLikes) {
    await prisma.performerLike.create({
      data: {
        ...val
      }
    })
  }

  for (const val of performerLinks) {
    await prisma.performerLink.create({
      data: {
        ...val
      }
    })
  }

  for (const val of eventLikes) {
    await prisma.eventLike.create({
      data: {
        ...val
      }
    })
  }

  for (const val of eventPreferences) {
    await prisma.eventTypePreference.create({
      data: {
        ...val
      }
    })
  }

  for (const val of promotionLikes) {
    await prisma.promotionLike.create({
      data: {
        ...val
      }
    })
  }

  for (const val of promotionPreferences) {
    await prisma.promotionTypePreference.create({
      data: {
        ...val
      }
    })
  }

  for (const val of engagementSource) {
    await prisma.engagementSource.create({
      data: {
        ...val
      }
    })
  }

  for (const val of engagementType) {
    await prisma.engagementType.create({
      data: {
        ...val
      }
    })
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
