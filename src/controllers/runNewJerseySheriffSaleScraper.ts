import { PrismaClient, Listing } from '@prisma/client';
import {
  scrapeCountyPage,
  getPropertyIds,
  getPropertyHtmlResponse,
  parseAddress,
  parsePropertyDetails,
  // saveHtmlToS3,
  parseStatusHistory,
} from '../services/newJerseySheriffSale';
import { NJ_COUNTIES } from '../services/constants';

const prisma = new PrismaClient();

export const runNewJerseySheriffSaleScraper = async (): Promise<void> => {
  await Promise.all(
    NJ_COUNTIES.map(async (county) => {
      console.log(`Parsing ${county} County...`);

      const { aspSessionId, html: countyHtml } = await scrapeCountyPage(county);

      // await saveHtmlToS3(countyPageResponse.data, county);

      const propertyIds = await getPropertyIds(countyHtml);

      const listingsResponses = await Promise.all(
        propertyIds.map(async (propertyId) => {
          const propertyHtmlResponse = await getPropertyHtmlResponse(propertyId, aspSessionId);

          const property = parsePropertyDetails(propertyHtmlResponse);
          const statusHistories = parseStatusHistory(propertyHtmlResponse);
          const parsedAddress = parseAddress(property.address);

          const listing = {
            ...property,
            ...parsedAddress,
            county,
            propertyId,
            state: 'NJ',
          } as unknown as Listing;

          return { listing, statusHistories };
        }),
      );

      await Promise.all(
        listingsResponses.map(async (listingResponse) => {
          const { listing, statusHistories } = listingResponse;

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

          console.log(`Creating ${statusHistories.length} Status Histories for Listing  ${newListing.id} ...`);
          await Promise.all(
            statusHistories.map(async (statusHistory) => {
              const statusHistoryModel = {
                ...statusHistory,
                listingId: newListing.id,
              };

              await prisma.statusHistory.create({ data: statusHistoryModel });
            }),
          );
        }),
      );

      console.log(`Parsed ${listingsResponses.length} new listings for ${county} County successfully!`);
    }),
  );
};
