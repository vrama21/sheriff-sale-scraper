import { newJerseySheriffSaleService } from '../services/newJerseySheriffSale';
import { ListingParse, NJCounty } from '@types';
import { prisma } from 'src/services/db';

export const newJerseySheriffSaleCountyParser = async (county: NJCounty): Promise<void> => {
  console.log(`Parsing ${county} County...`);

  const countyListingsHtml = await newJerseySheriffSaleService.getCountyListingsHtml(county);

  const propertyIds = await newJerseySheriffSaleService.parseCountyProperyIds(countyListingsHtml);

  console.log(`Found ${propertyIds.length} listings in ${county} County`);

  console.log(`Parsing ${propertyIds.length} listings in ${county} County...`);

  const listings = await Promise.all(
    propertyIds.map(async (propertyId) => {
      const listingDetailsHtml = await newJerseySheriffSaleService.getListingDetailsHtml({ propertyId });

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
          saleDate: listing.saleDate,
          sheriffId: listing.sheriffId,
        },
      });

      if (listingInDb) {
        const valuesHaveChanged = await prisma.listing.findFirst({
          where: {
            address: listing.address,
            city: listing.city,
            county: listing.county,
            street: listing.street,
            zipcode: listing.zipcode,
            attorney: listing.attorney,
            attorneyPhone: listing.attorneyPhone,
            courtCase: listing.courtCase,
            deed: listing.deed,
            deedAddress: listing.deedAddress,
            defendant: listing.defendant,
            description: listing.description,
            latitude: listing.latitude,
            longitude: listing.longitude,
            mapsUrl: listing.mapsUrl,
            judgment: listing.judgment,
            saleDate: listing.saleDate,
            unit: listing.unit,
            secondaryUnit: listing.secondaryUnit,
            upsetAmount: listing.upsetAmount,
            parcel: listing.parcel,
            plaintiff: listing.plaintiff,
            propertyId: listing.propertyId,
            sheriffId: listing.sheriffId,
          },
        });

        if (valuesHaveChanged) {
          console.log(`Detected a difference for listing ${listingInDb.id}. Updating ...`);
          await prisma.listing.update({ data: listing, where: { id: valuesHaveChanged.id } });
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
