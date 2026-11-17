/** Десятичные градусы (широта / долгота). */
export type DecimalDegrees = {
  latitude: number;
  longitude: number;
};

export type Place = {
  id: number;
  name: string;
  description: string;
  visitLater: boolean;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  createdAt: string;
};

export type Trip = {
  id: number;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  current: boolean;
};

export type TripPlace = {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
  photos: string[];
};

export type CreatePlaceInput = {
  name: string;
  description?: string;
  visitLater?: boolean;
  liked?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  photos?: string[];
};

export type UpdatePlaceInput = Partial<CreatePlaceInput>;

export type CreateTripInput = {
  title: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
};

export type UpdateTripInput = Partial<CreateTripInput>;

export type CreateTripPlaceInput = {
  tripId: number;
  placeId: number;
  order?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string;
  photos?: string[];
};

export type UpdateTripPlaceInput = {
  order?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string;
  photos?: string[];
};