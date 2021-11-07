import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import {
  getCountyId,
  getPropertyIds,
  getPropertyHtmlResponse,
  parsePropertyDetails,
} from '../services/newJerseySheriffSale';
import * as he from 'he';

export const runNewJerseySheriffSaleScraper = async (): Promise<void> => {
  const counties = [
    'Atlantic',
    'Bergen',
    'Burlington',
    'Camden',
    'Cumberland',
    'Essex',
    'Gloucester',
    'Hudson',
    'Hunterdon',
    'Monmouth',
    'Morris',
    'Passaic',
    'Salem',
    'Union',
  ];

  counties.map(async (county) => {
    console.log(`Parsing ${county} County...`);

    const countyId = getCountyId(county);
    const sheriffSaleUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

    const response = await axios.get(sheriffSaleUrl);
    const cookies = response.headers['set-cookie'] as string[];
    const aspSessionId = cookies[0];

    const countyHtml: string = he.decode(response.data);

    const propertyIds = await getPropertyIds(countyHtml);

    const properties = await Promise.all(propertyIds.map(async (propertyId) => {
      const propertyHtmlResponse = await getPropertyHtmlResponse(propertyId, aspSessionId);

      const property = parsePropertyDetails(propertyHtmlResponse);

      return property;
    }));

    console.log(`Parsed ${properties.length} new properties for ${county} County successfully!`)
  });
};
