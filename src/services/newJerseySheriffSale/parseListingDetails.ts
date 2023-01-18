import { parse } from 'node-html-parser';
import { cleanPropertyKey } from './cleanPropertyKey';
import { ListingParse } from '../../types';

export const parseListingDetails = (propertyHtml: string): ListingParse => {
  const root = parse(propertyHtml);

  const tables = root.querySelectorAll('table');
  const propertyDetailsTable = tables[0];
  const propertyTableRows = propertyDetailsTable.querySelectorAll('tr');

  const property = propertyTableRows.reduce((acc, row) => {
    const tds = row.querySelectorAll('td');

    const key = cleanPropertyKey(tds[0].innerText);
    const value = tds[1].innerText.replace('\n', ' ');

    return {
      ...acc,
      [key]: value,
    };
  }, {} as ListingParse);

  return property;
};
