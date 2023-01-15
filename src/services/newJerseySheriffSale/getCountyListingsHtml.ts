import axios from 'axios';
import { getCountyId } from './getCountyId';
import * as he from 'he';
import { NJCounty } from '../../types';

export type GetNJSheriffSaleCountyListingsHtml = {
  aspSessionId: string;
  html: string;
};

export const getCountyListingsHtml = async (county: NJCounty): Promise<GetNJSheriffSaleCountyListingsHtml> => {
  const countyId = getCountyId(county);
  const sheriffSaleUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

  try {
    const response = await axios.get<string>(sheriffSaleUrl);

    const cookies = response.headers['set-cookie'] as string[];
    const aspSessionId = cookies[0]
      .split(' ')[0]
      .split('=')[1]
      .replace(/[;\r\n]/g, '');

    if (response.status !== 200) {
      throw new Error(`Axios failed to a 200 response from ${sheriffSaleUrl}`);
    }

    return { aspSessionId, html: he.decode(response.data) };
  } catch (error) {
    console.error(`Scrape County Page failed:`, error);

    throw error;
  }
};
