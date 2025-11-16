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
    location: venue.location,
  };
}

export function mapEventToFeedItem(event: any, venue: any): FeedItemDTO {
  const location =
    venue != null && venue.location != null ? venue.location : event.location;

  if (event.performers.length === 1) {
    const performer = event.performers[0].performer;

    console.log(performer);

    return {
      id: performer.id,
      image: performer.image,
      title: performer.name,
      price: event.price,
      date: event.startDate,
      venueName: venue.name,
      subcategory: event.eventType.eventType,
      type: SubcategoryType.Performer,
      location: location,
    };
  }

  return {
    id: event.id,
    image: event.image,
    title: event.title,
    price: event.price,
    date: event.startDate,
    venueName: venue.name,
    subcategory: event.eventType.eventType,
    type: SubcategoryType.Event,
    location: location,
  };
}

export function mapPromotionToFeedItem(
  promotion: any,
  venue: any
): FeedItemDTO {
  const location = venue.location ? venue.location : promotion.location;

  return {
    id: promotion.id,
    image: promotion.image,
    title: promotion.title,
    price: promotion.price,
    date: promotion.startDate,
    venueName: venue.name,
    subcategory: promotion.promotionType.promotionType,
    type: SubcategoryType.Promotion,
    location: location,
  };
}
