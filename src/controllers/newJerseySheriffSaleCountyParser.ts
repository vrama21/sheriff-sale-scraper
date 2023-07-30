import { newJerseySheriffSaleService } from '../services';
import { NJCounty } from '@types';
import { newJerseySheriffSaleListingParser } from './newJerseySheriffSaleListingParser';

export const newJerseySheriffSaleCountyParser = async (county: NJCounty): Promise<void> => {
  console.log(`Parsing ${county} County...`);

  const countyListingsHtml = await newJerseySheriffSaleService.getCountyListingsHtml(county);

  const propertyIds = await newJerseySheriffSaleService.parseCountyProperyIds(countyListingsHtml);

  console.log(`Found ${propertyIds.length} listings in ${county} County`);

  await newJerseySheriffSaleListingParser({
    county,
    propertyIds,
  });

  // await newJerseySheriffSaleService.sendMessageToListingParserQueue({
  //   aspSessionId,
  //   county,
  //   propertyIds,
  // });
};
