import { parse } from 'node-html-parser';
import { StatusHistory } from '../../types';

export const parseStatusHistory = (propertyHtmlResponse: string): StatusHistory[] => {
  const root = parse(propertyHtmlResponse);

  const tables = root.querySelectorAll('table');
  const statusHistoryTable = tables[1];
  const statusHistoryTableRows = statusHistoryTable.querySelectorAll('tr').slice(1);

  const statusHistory: StatusHistory[] = statusHistoryTableRows.map((row) => {
    const status = row.childNodes[1].innerText;
    const date = row.childNodes[3].innerText;

    return { status, date };
  });

  return statusHistory;
};
