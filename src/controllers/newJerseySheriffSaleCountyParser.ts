import { newJerseySheriffSaleService } from '../services';
import { NJCounty } from '@types';

export const newJerseySheriffSaleCountyParser = async (county: NJCounty): Promise<void> => {
  console.log(`Parsing ${county} County...`);

  const { aspSessionId, html: countyListingsHtml } = await newJerseySheriffSaleService.getCountyListingsHtml(county);

  const propertyIds = await newJerseySheriffSaleService.parseCountyProperyIds(countyListingsHtml);

  console.log(`Found ${propertyIds.length} listings in ${county} County`);

  await newJerseySheriffSaleService.sendMessageToListingParserQueue({
    aspSessionId,
    county,
    propertyIds,
  });
};
