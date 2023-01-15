import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { runNewJerseySheriffSaleScraper } from '../controllers';

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> {
  let response: APIGatewayProxyResultV2;

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await runNewJerseySheriffSaleScraper();

    response = {
      body: JSON.stringify({
        message: 'New Jersey Sheriff Sale Scraper ran successfully.',
      }),
      statusCode: 200,
    };
  } catch (error: any) {
    console.error(error);

    response = {
      body: JSON.stringify({ message: error.message }),
      statusCode: 500,
    };
  } finally {
    await prisma.$disconnect();
  }

  return response;
}
