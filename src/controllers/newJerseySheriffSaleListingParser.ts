import { PrismaClient } from '@prisma/client';
import { newJerseySheriffSaleService } from '../services';
import { ListingParse, SendMessageToListingParserQueueArgs } from '../types';
import { PromisePool } from '@supercharge/promise-pool';
import { every } from 'lodash';

export const newJerseySheriffSaleListingParser = async ({
  aspSessionId,
  county,
  propertyIds,
}: SendMessageToListingParserQueueArgs): Promise<void> => {
  const prisma = new PrismaClient();

  console.log(`Parsing ${propertyIds.length} listings in ${county} County...`);

  const { results: listings } = await PromisePool.withConcurrency(5)
    .for(propertyIds)
    .process(async (propertyId) => {
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
    });

  console.log(`Parsed ${listings.length} listings in ${county} County`);

  await Promise.all(
    listings.map(async ({ listing, statusHistory }) => {
      const listingInDb = await prisma.listing.findFirst({
        where: {
          saleDate: listing.saleDate,
          sheriffId: listing.sheriffId,
        },
      });

      if (listingInDb) {
        const valuesHaveChanged = !every(listingInDb, (value, key) => value === listing[key]);

        if (valuesHaveChanged) {
          console.log(`Detected a difference for listing ${listingInDb.id}. Updating ...`);
          await prisma.listing.update({ data: listing, where: { id: listingInDb.id } });
        }

        console.log(`Listing ${listingInDb.id} already exists. Skipping ...`);

        return;
      }

      console.log(`Creating Listing propertyId ${listing.propertyId} and address ${listing.address} ...`);
      const newListing = await prisma.listing.create({ data: listing });
      console.log(`Created Listing ${newListing.id}`);

      console.log(`Found ${statusHistory.length} Status Histories for Listing ${newListing.id} ...`);
      await Promise.all(
        statusHistory.map(async (statusHistory) => {
          const statusHistoryInDb = await prisma.statusHistory.findFirst({
            where: {
              listingId: newListing.id,
              date: statusHistory.date,
              status: statusHistory.status,
            },
          });

          if (statusHistoryInDb) {
            console.log(`Status History ${statusHistoryInDb.id} already exists. Skipping ...`);

            return;
          }

          console.log(`Creating Status History for listing ${newListing.id} ...`);
          const newStatusHistory = await prisma.statusHistory.create({
            data: { ...statusHistory, listingId: newListing.id },
          });
          console.log(`Created Status History ${newStatusHistory.id} for listing ${newListing.id}`);
        }),
      );
    }),
  );

  console.log(`Parsed ${listings.length} new listings for ${county} County successfully!`);
};
