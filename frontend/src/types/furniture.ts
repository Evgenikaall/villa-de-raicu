export type Reservation = {
  name: string;
  phone: string;
  persons: number;
  reservedAt?: string; // ISO date, e.g. 2024-07-01
  reservedUntil?: string; // ISO datetime, e.g. 2024-07-01T18:00
};

export type FurnitureItem = {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  reservation?: Reservation ;
};

export type FloorData = {
  id: number;
  name: string;
  imageUrl: string;
  furniture: FurnitureItem[];
};
