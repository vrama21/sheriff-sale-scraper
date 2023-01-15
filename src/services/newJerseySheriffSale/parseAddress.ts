import { startCase } from 'lodash';
import { ADDRESS_SUFFIX } from '../constants';

export interface ParseAddressResponse {
  city: string | null;
  secondaryUnit: string | null;
  street: string | null;
  unit: string | null;
  zipcode: string | null;
}

export const parseAddress = (address: string): ParseAddressResponse => {
  console.log(`Parsing address: ${address} ...`);

  const streetRegex = new RegExp(`.+(?<={${ADDRESS_SUFFIX.join('|')}})`);
  const cityRegex = new RegExp(`.+(${ADDRESS_SUFFIX.join('|')})(.+)(NJ)`);
  const unitRegex = /(UNIT|APT)[.\s#]+?([0-9A-Za-z-]+)/g;
  const secondaryUnitRegex = /(BUILDING|ESTATE)[s#]+?([0-9a-zA-Z]+)/;
  const zipcodeRegex = /\d{5}/g;

  const streetMatch = streetRegex.exec(address);
  const cityMatch = cityRegex.exec(address);
  const unitMatch = unitRegex.exec(address);
  const secondaryUnitMatch = secondaryUnitRegex.exec(address);
  const zipcodeMatch = zipcodeRegex.exec(address);

  return {
    city: cityMatch && startCase(cityMatch[2].trim().toLowerCase()),
    secondaryUnit: secondaryUnitMatch && startCase(secondaryUnitMatch[0].trim().toLowerCase()),
    street: streetMatch && startCase(streetMatch[0].trim().toLowerCase()),
    unit: unitMatch && startCase(unitMatch[0].trim().toLowerCase()),
    zipcode: zipcodeMatch && startCase(zipcodeMatch[0].trim().toLowerCase()),
  };
};
