import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { newJerseySheriffSaleCountyParser } from '../controllers';

export async function handler(_event: APIGatewayProxyEvent): Promise<string> {
  const prisma = new PrismaClient();
  await prisma.$connect();

  let shouldThrowError = false;
  try {
    await newJerseySheriffSaleCountyParser();
  } catch (error) {
    console.error(error);

    shouldThrowError = true;
  } finally {
    await prisma.$disconnect();
  }

  if (shouldThrowError) {
    throw new Error('New Jersey Sheriff Sale Scraper failed.');
  }

  return 'New Jersey Sheriff Sale Scraper ran successfully.';
}
