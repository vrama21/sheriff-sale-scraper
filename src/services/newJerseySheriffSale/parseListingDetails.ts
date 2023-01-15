import { parse } from 'node-html-parser';
import { propertyKeyCleaner } from './propertyKeyCleaner';
import { Listing } from '@prisma/client';

export const parseListingDetails = (propertyHtml: string) => {
  const root = parse(propertyHtml);

  const tables = root.querySelectorAll('table');
  const propertyDetailsTable = tables[0];
  const propertyTableRows = propertyDetailsTable.querySelectorAll('tr');

  let property = {} as Listing;

  propertyTableRows.map((row) => {
    const key = propertyKeyCleaner(row.childNodes[1].innerText);
    const value = row.childNodes[3].innerText.trim();

    property = {
      ...property,
      [key]: value,
    };

    return property;
  });

  return property;
};