import axios from 'axios';
import { getCountyId } from './getCountyId';
import * as he from 'he';
import { NJCounty } from '../../types';
import { saveHtmlToS3 } from './saveHtmlToS3';

export type GetNJSheriffSaleCountyListingsHtml = {
  aspSessionId: string;
  html: string;
};

export const getCountyListingsHtml = async (county: NJCounty): Promise<GetNJSheriffSaleCountyListingsHtml> => {
  const countyId = getCountyId(county);
  const sheriffSaleCountyListingsUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

  try {
    console.log(`Getting html for ${county} county from ${sheriffSaleCountyListingsUrl} ...`);
    const response = await axios.get<string>(sheriffSaleCountyListingsUrl);

    if (!response.data || response.status !== 200) {
      throw new Error(`Axios failed to get data from ${sheriffSaleCountyListingsUrl}`);
    }

    const html = he.decode(response.data);
    const cookies = response.headers['set-cookie'] as string[];
    const aspSessionId = cookies[0]
      .split(' ')[0]
      .split('=')[1]
      .replace(/[;\r\n]/g, '');

    console.log(`Got html for ${county} county from ${sheriffSaleCountyListingsUrl}`);

    await saveHtmlToS3({ html, keyPrefix: 'county-html-files', keySuffix: `${county.toLowerCase()}-county.html` });

    return { aspSessionId, html };
  } catch (error) {
    console.error(`Scrape County Page failed:`, error);

    throw error;
  }
};
