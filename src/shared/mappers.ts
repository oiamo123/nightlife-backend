import { SubcategoryType } from "./models.ts";
import type { Marker, FeedItemDTO } from "./models.ts";

export function mapVenueToMarker({ venue }: { venue: any }): Marker {
  return {
    id: venue.id,
    lat: venue.location.lat,
    lng: venue.location.lng,
    title: venue.name,
    type: SubcategoryType.Venue,
  };
}

export function mapEventToMarker({ event }: { event: any }): Marker {
  return {
    id: event.id,
    lat: event.location.lat,
    lng: event.location.lng,
    title: event.title,
    type: SubcategoryType.Event,
  };
}

export function mapPromotionToMarker({
  promotion,
}: {
  promotion: any;
}): Marker {
  return {
    id: promotion.id,
    lat: promotion.location.lat,
    lng: promotion.location.lng,
    title: promotion.title,
    type: SubcategoryType.Promotion,
  };
}

export function mapVenueToFeedItem({ venue }: { venue: any }): FeedItemDTO {
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

export function mapEventToFeedItem({
  event,
  venueName,
}: {
  event: any;
  venueName?: string | null;
}): FeedItemDTO {
  return {
    id: event.id,
    image: event.image,
    title: event.title,
    price: event.price,
    date: event.startDate,
    venueName: venueName,
    subcategory: event.eventType.eventType,
    type: SubcategoryType.Event,
    location: event.location,
  };
}

export function mapPromotionToFeedItem({
  promotion,
  venueName,
}: {
  promotion: any;
  venueName: string;
}): FeedItemDTO {
  return {
    id: promotion.id,
    image: promotion.image,
    title: promotion.title,
    price: promotion.price,
    date: promotion.startDate,
    venueName: venueName,
    subcategory: promotion.promotionType.promotionType,
    type: SubcategoryType.Promotion,
    location: promotion.location,
  };
}

export function mapPerformerToFeedItem({
  performer,
}: {
  performer: any;
}): FeedItemDTO {
  return {
    id: performer.id,
    image: performer.image,
    title: performer.name,
    price: null,
    date: performer.startDate,
    venueName: null,
    subcategory: performer.eventType.eventType,
    type: SubcategoryType.Performer,
    city: performer.city,
  };
}
