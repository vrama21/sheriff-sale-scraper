/**
 * @jest-environment jsdom
 */

import { parseListingDetails } from './parseListingDetails';

describe('parseListingDetails', () => {
  it.each([['40-42 MYRTLE STREET\nBRIDGETON NJ 08302', { address: '40-42 MYRTLE STREET BRIDGETON NJ 08302' }]])(
    'should parse %s to %s',
    (addressFromHtml, parsedListingProperties) => {
      const html = document.createElement('div');
      const table = document.createElement('table');
      const tbody = document.createElement('tbody');
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      const a = document.createElement('a');
      const td3 = document.createElement('td');

      td2.appendChild(a);
      tr.append(td1, td2, td3);
      tbody.appendChild(tr);
      table.appendChild(tbody);

      td1.textContent = 'Address';
      a.textContent = addressFromHtml;
      td3.textContent = ' ';

      html.appendChild(table);

      const parsedListing = parseListingDetails(html.innerHTML);

      expect(parsedListing).toEqual(parsedListingProperties);
    },
  );
});
