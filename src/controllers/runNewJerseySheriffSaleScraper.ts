import axios from 'axios';
import {
  getCountyId,
  getCountyPageResponse,
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
  ] as const;

  counties.map(async (county) => {
    console.log(`Parsing ${county} County...`);

    const countyPageResponse = await getCountyPageResponse(county)
    
    const cookies = countyPageResponse.headers['set-cookie'] as string[];
    const aspSessionId = cookies[0];
    const countyHtml = he.decode(countyPageResponse.data);

    const propertyIds = await getPropertyIds(countyHtml);

    const properties = await Promise.all(propertyIds.map(async (propertyId) => {
      const propertyHtmlResponse = await getPropertyHtmlResponse(propertyId, aspSessionId);

      const property = parsePropertyDetails(propertyHtmlResponse);

      return property;
    }));

    console.log(`Parsed ${properties.length} new properties for ${county} County successfully!`)
  });
};
