import { StatusHistory } from './statusHistory';

export interface Property {
  address: string;
  attorney: string;
  attorneyPhone: string | undefined;
  courtCase: string;
  deed: string | undefined;
  deedAddress: string | undefined;
  defendant: string;
  description: string | undefined;
  judgment: string;
  parcel: string;
  plaintiff: string;
  priors: string | undefined;
  saleDate: string;
  sheriff: string;
  statusHistory: StatusHistory[];
  upset: string;
}
