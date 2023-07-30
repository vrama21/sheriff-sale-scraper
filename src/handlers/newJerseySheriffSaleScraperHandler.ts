import { APIGatewayProxyEvent } from 'aws-lambda';
import { newJerseySheriffSaleCountyParser } from '../controllers';
import { NJ_COUNTIES } from '@types';

export async function handler(_event: APIGatewayProxyEvent): Promise<string> {
  let shouldThrowError = false;

  await Promise.all(
    NJ_COUNTIES.map(async (county) => {
      try {
        await newJerseySheriffSaleCountyParser(county);
      } catch (error) {
        console.error(error);

        shouldThrowError = true;
      }
    }),
  );

  if (shouldThrowError) {
    throw new Error('New Jersey Sheriff Sale Scraper failed.');
  }

  return 'New Jersey Sheriff Sale Scraper ran successfully.';
}
