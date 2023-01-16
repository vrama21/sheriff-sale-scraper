import { parse } from 'node-html-parser';
import { cleanPropertyKey } from './cleanPropertyKey';
import { ListingParse } from '../../types';

export const parseListingDetails = (propertyHtml: string): ListingParse => {
  const root = parse(propertyHtml);

  const tables = root.querySelectorAll('table');
  const propertyDetailsTable = tables[0];
  const propertyTableRows = propertyDetailsTable.querySelectorAll('tr');

  const property = propertyTableRows.reduce((acc, row) => {
    const key = cleanPropertyKey(row.childNodes[1].innerText);
    const value = row.childNodes[3].innerText.replace('\n', ' ');

    return {
      ...acc,
      [key]: value,
    };
  }, {} as ListingParse);

  return property;
};
