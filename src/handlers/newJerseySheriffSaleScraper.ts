import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { runNewJerseySheriffSaleScraper } from '../controllers';

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> {
  const prisma = new PrismaClient();

  await runNewJerseySheriffSaleScraper()
    .catch((error: Error) => {
      console.error(error);

      return {
        body: JSON.stringify({ message: error.message }),
        statusCode: 500,
      };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return {
    body: JSON.stringify({
      message: 'New Jersey Sheriff Sale Scraper ran successfully.',
    }),
    statusCode: 200,
  };
}
