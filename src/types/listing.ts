import { StatusHistory } from './statusHistory';

export interface Listing {
  address: string;
  attorney?: string;
  attorneyPhone?: string;
  city?: string | null;
  county: string;
  courtCase?: string;
  deed?: string;
  deedAddress?: string;
  defendant?: string;
  description?: string;
  judgment?: string;
  latitude?: string;
  longitude?: string;
  mapsUrl?: string;
  parcel?: string;
  plaintiff: string;
  priors?: string;
  propertyId: string;
  saleDate: string;
  secondaryUnit?: string | null;
  sheriffId: string;
  state: string;
  statusHistory?: StatusHistory[];
  street?: string | null;
  unit?: string | null;
  upsetAmount?: string;
  zipcode?: string | null;
}
