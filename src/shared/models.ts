export const SubcategoryType = {
  Event: "event",
  Promotion: "promotion",
  Venue: "venue",
};

export type FeedItemDTO = {
  id: number;
  image: string | null;
  title: string;
  price?: number | null;
  date?: Date | null;
  venueName?: string | null;
  subcategory: string;
  type: string;
  location: LocationDTO;
};

export type Marker = {
  lat: number;
  lng: number;
  id: number;
  title: string;
  type: string;
};

export type CityDTO = {
  id: number;
  city: string;
  countryId: number;
  stateId: number;
  timeZoneId: number;
};

export type LocationDTO = {
  id: number;
  lat: number;
  lng: number;
  zip: string;
  address: string;
  cityId: string;
  city: CityDTO;
};
