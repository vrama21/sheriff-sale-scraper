import { PrismaClient } from '@prisma/client';
import { newJerseySheriffSaleService } from '../services';
import { ListingParse, SendMessageToListingParserQueueArgs } from '../types';

export const newJerseySheriffSaleListingParser = async ({
  aspSessionId,
  county,
  propertyIds,
}: SendMessageToListingParserQueueArgs): Promise<void> => {
  const prisma = new PrismaClient();
  console.log(`Parsing ${propertyIds.length} listings in ${county} County...`);

  const listings = await Promise.all(
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

  console.log(`Parsed ${listings.length} listings in ${county} County`);

  await Promise.all(
    listings.map(async ({ listing, statusHistory }) => {
      const listingInDb = await prisma.listing.findFirst({
        where: {
          propertyId: listing.propertyId,
          saleDate: listing.saleDate,
          sheriffId: listing.sheriffId,
        },
      });

      const statusHistoryInDb = await prisma.statusHistory.findFirst({
        where: {
          listingId: listingInDb?.id,
        },
      });

      if (listingInDb) {
        if (listing !== listingInDb) {
          console.log(`Detected a difference from the matching database record. Updating ...`);
          await prisma.listing.update({ data: listing, where: { id: listingInDb.id } });
        }

        console.log(`Listing ${listing.propertyId} already exists. Skipping ...`);

        return;
      }

      if (statusHistoryInDb) {
        console.log(`Status History for Listing propertyId ${listing.propertyId} already exists. Skipping ...`);

        return;
      }

      console.log(`Creating Listing ${listing.address} ...`);
      const newListing = await prisma.listing.create({ data: listing });

      console.log(`Creating ${statusHistory.length} Status Histories for Listing  ${newListing.id} ...`);
      await Promise.all(
        statusHistory.map(async (statusHistory) => {
          const statusHistoryModel = {
            ...statusHistory,
            listingId: newListing.id,
          };

          await prisma.statusHistory.create({ data: statusHistoryModel });
        }),
      );
    }),
  );

  console.log(`Parsed ${listings.length} new listings for ${county} County successfully!`);
};
