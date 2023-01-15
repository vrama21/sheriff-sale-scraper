import { newJerseySheriffSaleService } from '../services';
import { NJ_COUNTIES } from '../types';

export const newJerseySheriffSaleScraper = async (): Promise<void> => {
  await Promise.all(
    NJ_COUNTIES.map(async (county) => {
      console.log(`Parsing ${county} County...`);

      const { aspSessionId, html: countyListingsHtml } = await newJerseySheriffSaleService.getCountyListingsHtml(
        county,
      );

      const propertyIds = await newJerseySheriffSaleService.parseCountyProperyIds(countyListingsHtml);

      console.log(`Found ${propertyIds.length} listings in ${county} County`);

      await newJerseySheriffSaleService.sendMessageToListingParserQueue({
        aspSessionId,
        county,
        propertyIds,
      });
    }),
  );
};
