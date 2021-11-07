import { StatusHistory } from './statusHistory';

export interface Property {
  address: string;
  attorney: string;
  attorneyPhone?: string
  courtCase: string;
  deed?: string;
  deedAddress?: string;
  defendant: string;
  description?: string;
  judgment: string;
  parcel: string;
  plaintiff: string;
  priors?: string;
  saleDate: string;
  sheriff: string;
  statusHistory: StatusHistory[];
  upset: string;
}
