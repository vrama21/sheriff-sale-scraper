import { PrismaClient } from '@prisma/client';
import * as he from 'he';
import {
  getCountyPageResponse,
  getPropertyIds,
  getPropertyHtmlResponse,
  parseAddress,
  parsePropertyDetails,
  saveHtmlToS3,
} from '../services/newJerseySheriffSale';
import { NJ_COUNTIES } from '../services/constants';
import { Listing } from '../types';

const prisma = new PrismaClient();

export const runNewJerseySheriffSaleScraper = async (): Promise<void> => {
  await Promise.all(
    NJ_COUNTIES.map(async (county) => {
      console.log(`Parsing ${county} County...`);

      const countyPageResponse = await getCountyPageResponse(county);

      await saveHtmlToS3(countyPageResponse.data, county);

      const cookies = countyPageResponse.headers['set-cookie'] as string[];
      const aspSessionId = cookies[0];
      const countyHtml = he.decode(countyPageResponse.data);

      const propertyIds = await getPropertyIds(countyHtml);

      const listings: Listing[] = await Promise.all(
        propertyIds.map(async (propertyId) => {
          const propertyHtmlResponse = await getPropertyHtmlResponse(propertyId, aspSessionId);

          const property = parsePropertyDetails(propertyHtmlResponse);
          const parsedAddress = parseAddress(property.address);

          const listing = {
            ...property,
            ...parsedAddress,
            county,
            propertyId,
            state: 'NJ',
          };

          return listing;
        }),
      );

      await Promise.all(
        listings.map(async (listing) => {
          const listingInDb = await prisma.listing.findFirst({
            where: { propertyId: listing.propertyId, saleDate: listing.saleDate, sheriffId: listing.sheriffId },
          });

          if (listingInDb) {
            console.log(`Listing ${listing.propertyId} already exists ...`);

            if (listing !== listingInDb) {
              console.log(`Detected a difference from the matching database record. Updating ...`);
              await prisma.listing.update({ data: listing, where: { id: listingInDb.id } });
            }

            return;
          }

          console.log(`Creating listing ${listing.address} ...`);
          await prisma.listing.create({ data: listing });
        }),
      );

      console.log(`Parsed ${listings.length} new listings for ${county} County successfully!`);
    }),
  );
};
