import { parse } from 'node-html-parser';
import { StatusHistoryParse } from '../../types';

export const parseStatusHistory = (listingDetailHtml: string): StatusHistoryParse[] => {
  const root = parse(listingDetailHtml);

  const tables = root.querySelectorAll('table');
  const statusHistoryTable = tables[1];
  const statusHistoryTableRows = statusHistoryTable.querySelectorAll('tr').slice(1);

  const statusHistory: StatusHistoryParse[] = statusHistoryTableRows.map((row) => {
    const status = row.childNodes[1].innerText;
    const date = row.childNodes[3].innerText;

    return { status, date };
  });

  return statusHistory;
};
