import axios, { isAxiosError } from 'axios';
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
    console.log(`Getting html for ${county} county from ${sheriffSaleUrl} ...`);
    const response = await axios.get<string>(sheriffSaleUrl);

    if (response.status !== 200) {
      throw new Error(`Axios failed to a 200 response from ${sheriffSaleUrl}`);
    }

    const cookies = response.headers['set-cookie'] as string[];
    const aspSessionId = cookies[0]
      .split(' ')[0]
      .split('=')[1]
      .replace(/[;\r\n]/g, '');

    console.log(`Got html for ${county} county from ${sheriffSaleUrl} with aspSessionId ${aspSessionId} ...`);

    return { aspSessionId, html: he.decode(response.data) };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(`Scrape County Page failed:`, error.response?.data);
    }
    console.error(`Scrape County Page failed:`, error);

    throw error;
  }
};
