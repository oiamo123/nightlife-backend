export const SubcategoryType = {
  Event: "event",
  Promotion: "promotion",
  Venue: "venue",
};

export interface FeedItemDTO {
  id: number;
  image: string | null;
  title: string;
  price?: number | null;
  date?: Date | null;
  venueName?: string | null;
  subcategory: string;
  type: string;
  location?: LocationDTO | null;
}

export interface Marker {
  lat: number;
  lng: number;
  id: number;
  title: string;
  type: string;
}

export interface LocationDTO {
  id: number;
  lat: number;
  lng: number;
  zip: string;
  address: string;
  cityId: string;
}
