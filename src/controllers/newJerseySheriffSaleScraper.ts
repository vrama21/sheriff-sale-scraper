import { PrismaClient } from '@prisma/client';
import { newJerseySheriffSaleService } from '../services';
import { NJ_COUNTIES, ListingParse } from '../types';

export const newJerseySheriffSaleScraper = async (): Promise<void> => {
  const prisma = new PrismaClient();

  await Promise.all(
    NJ_COUNTIES.map(async (county) => {
      console.log(`Parsing ${county} County...`);

      const { aspSessionId, html: countyListingsHtml } = await newJerseySheriffSaleService.getCountyListingsHtml(
        county,
      );

      const propertyIds = await newJerseySheriffSaleService.parseCountyProperyIds(countyListingsHtml);
      // const listingDetailsHtml = await Promise.all(
      //   propertyIds.map(async (propertyId) => ({
      //     propertyId,
      //     listingDetailHtml: await newJerseySheriffSaleService.getListingDetailsHtml(propertyId, aspSessionId),
      //   })),
      // );

      const listingDetailsHtml = [
        {
          propertyId: propertyIds[0],
          listingDetailHtml: await newJerseySheriffSaleService.getListingDetailsHtml(propertyIds[0], aspSessionId),
        },
      ];

      const listings = await Promise.all(
        listingDetailsHtml.map(({ listingDetailHtml, propertyId }) => {
          const listingDetails = newJerseySheriffSaleService.parseListingDetails(listingDetailHtml);
          const statusHistory = newJerseySheriffSaleService.parseStatusHistory(listingDetailHtml);
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
    }),
  );
};
