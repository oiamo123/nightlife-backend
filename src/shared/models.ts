export const SubcategoryType = {
  Event: "event",
  Promotion: "promotion",
  Venue: "venue",
  Performer: "performer",
};

export const Role = {
  user: 0,
  guest: 1,
  venueUser: 2,
  venue: 3,
  organizer: 4,
};

export const EngagementType = {
  click: 0,
  impression: 1,
  dwellTime: 2,
};

export const EngagementSource = {
  map: 0,
  list: 1,
  page: 2,
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
  location?: LocationDTO | null;
  city?: CityDTO | null;
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
