import { startCase } from 'lodash';
import { ADDRESS_SUFFIX } from '../constants';
import { parseLocation } from 'parse-address';

export const cleanAddress = (address: string) => {
  console.log(`Parsing address: ${address} ...`);

  const parsedAddress = parseLocation(address);
  console.log({ parsedAddress });

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

  let street = streetMatch && streetMatch[0];
  if (streetMatch) {
    street = streetMatch[0];
    const regex = new RegExp('([A-Za-z]+)', 'g');
    const matches = streetMatch[0].match(regex);

    matches?.forEach((match) => street?.replace(match, startCase(match.toLowerCase())));
    console.log({ matches });
  }

  return {
    city: cityMatch ? startCase(cityMatch[2].trim().toLowerCase()) : '',
    street: streetMatch ? startCase(streetMatch[0].trim().toLowerCase()) : '',
    zipcode: zipcodeMatch ? startCase(zipcodeMatch[0].trim().toLowerCase()) : '',
    unit: unitMatch ? startCase(unitMatch[0].trim().toLowerCase()) : '',
    secondaryUnit: secondaryUnitMatch ? startCase(secondaryUnitMatch[0].trim().toLowerCase()) : '',
  };
};
