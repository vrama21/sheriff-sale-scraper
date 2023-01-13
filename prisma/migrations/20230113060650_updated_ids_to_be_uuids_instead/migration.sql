-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "attorney" TEXT,
    "attorneyPhone" TEXT,
    "city" TEXT,
    "county" TEXT NOT NULL,
    "courtCase" TEXT,
    "deed" TEXT,
    "deedAddress" TEXT,
    "defendant" TEXT,
    "description" TEXT,
    "judgment" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "mapsUrl" TEXT,
    "parcel" TEXT,
    "plaintiff" TEXT NOT NULL,
    "priors" TEXT,
    "propertyId" TEXT NOT NULL,
    "saleDate" TEXT NOT NULL,
    "secondaryUnit" TEXT,
    "sheriffId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "street" TEXT,
    "unit" TEXT,
    "upsetAmount" TEXT,
    "zipcode" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
