import { parse } from 'node-html-parser';
import { propertyKeyCleaner } from './propertyKeyCleaner';
import { Property, StatusHistory } from '../../models';



export const parsePropertyDetails = (propertyHtmlResponse: string): Property => {
  const root = parse(propertyHtmlResponse);

  const tables = root.querySelectorAll('table');
  const propertyDetailsTable = tables[0];
  const propertyTableRows = propertyDetailsTable.querySelectorAll('tr');

  let property = {} as Property;

  propertyTableRows.map((row) => {
    const key: PropertyKey = propertyKeyCleaner(row.childNodes[1].innerText);
    const value = row.childNodes[3].innerText.trim();

    property = {
      ...property,
      [key]: value,
    };
  });

  const statusHistoryTable = tables[1];
  const statusHistoryTableRows = statusHistoryTable.querySelectorAll('tr').slice(1);

  const statusHistory = statusHistoryTableRows.map((row) => {
    const status = row.childNodes[1].innerText;
    const date = row.childNodes[3].innerText;

    return { status, date };
  });

  property = {
    ...property,
    statusHistory,
  };

  return property;
};
