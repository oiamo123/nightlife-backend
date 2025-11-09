import { SubcategoryType } from "./models.ts";
import type { Marker, FeedItemDTO } from "./models.ts";

export function mapVenueToMarker(venue: any): Marker {
  return {
    id: venue.id,
    lat: venue.location.lat,
    lng: venue.location.lng,
    title: venue.name,
    type: SubcategoryType.Venue,
  };
}

export function mapEventToMarker(event: any, venue: any): Marker {
  return {
    id: event.id,
    lat: venue.location.lat,
    lng: venue.location.lng,
    title: event.title,
    type: SubcategoryType.Event,
  };
}

export function mapPromotionToMarker(promotion: any, venue: any): Marker {
  return {
    id: promotion.id,
    lat: venue.location.lat,
    lng: venue.location.lng,
    title: promotion.title,
    type: SubcategoryType.Promotion,
  };
}

export function mapVenueToFeedItem(venue: any): FeedItemDTO {
  return {
    id: venue.id,
    image: venue.image,
    title: venue.name,
    price: null,
    date: null,
    subcategory: venue.venueType.venueType,
    type: SubcategoryType.Venue,
    location: {
      id: venue.location.id,
      lat: venue.location.lat,
      lng: venue.location.lng,
      address: venue.location.address,
      cityId: venue.location.cityId,
      zip: venue.location.zip,
    },
  };
}

export function mapEventToFeedItem(event: any, venue: any): FeedItemDTO {
  console.log(event, venue);

  return {
    id: event.id,
    image: event.image,
    title: event.title,
    price: event.price,
    date: event.startDate,
    venueName: venue.name,
    subcategory: event.eventType.eventType,
    type: SubcategoryType.Event,
  };
}

export function mapPromotionToFeedItem(
  promotion: any,
  venue: any | null
): FeedItemDTO {
  return {
    id: promotion.id,
    image: promotion.image,
    title: promotion.title,
    price: promotion.price,
    date: promotion.startDate,
    venueName: venue.name,
    subcategory: promotion.promotionType.promotionType,
    type: SubcategoryType.Promotion,
  };
}
