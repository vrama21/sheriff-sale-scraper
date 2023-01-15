import { newJerseySheriffSaleService } from '../services';
import { ListingParse, SendMessageToListingParserQueueArgs } from '../types';

export const newJerseySheriffSaleListingParser = async ({
  aspSessionId,
  county,
  propertyIds,
}: SendMessageToListingParserQueueArgs): Promise<void> => {
  console.log(`Parsing ${propertyIds.length} listings in ${county} County...`);

  const listingsDetailsHtml = await Promise.all(
    propertyIds.map(async (propertyId) => {
      const listingDetailsHtml = await newJerseySheriffSaleService.getListingDetailsHtml({ aspSessionId, propertyId });

      const listingDetails = newJerseySheriffSaleService.parseListingDetails(listingDetailsHtml);
      const statusHistory = newJerseySheriffSaleService.parseStatusHistory(listingDetailsHtml);
      const cleanedAddress = newJerseySheriffSaleService.cleanAddress(listingDetails.address);

      const listing: ListingParse = {
        ...listingDetails,
        ...cleanedAddress,
        county,
        propertyId,
        state: 'NJ',
      };

      return { listing, statusHistory };
    }),
  );

  console.log(`Parsed ${listingsDetailsHtml.length} listings in ${county} County`);
};
