declare module 'parse-address' {
  export interface ParseLocationResponse {
    city: string;
    number: string;
    state: string;
    street: string;
    streetNumber: string;
    streetType: string;
    type: string;
    zip: string;
  }

  export function parseLocation(address: string): ParseLocationResponse;
}
