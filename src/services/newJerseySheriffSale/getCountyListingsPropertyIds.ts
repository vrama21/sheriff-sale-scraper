import { HTMLElement, parse } from 'node-html-parser';

export const getPropertyIds = async (countyHtmlResponse: string): Promise<string[]> => {
  const root = parse(countyHtmlResponse);

  const listingsTableDiv = root.querySelectorAll('table').slice(-1)[0];
  const listingTableRows = listingsTableDiv.querySelectorAll('tr').slice(1);

  const propertyIds = listingTableRows.map((listingTableRow) => {
    const tableCells = listingTableRow.querySelectorAll('td');
    const firstCell = tableCells[0].firstChild as HTMLElement;
    const listingHref = firstCell.getAttribute('href') as string;

    const propertyId = listingHref.match(/\d+/g)?.slice(0)[0];

    return propertyId as string;
  });

  return propertyIds;
};
