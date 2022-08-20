import { config } from 'dotenv';
import { runNewJerseySheriffSaleScraper } from './controllers';
import { getPrismaClient } from './services/prisma';

config();
const prisma = getPrismaClient();

void runNewJerseySheriffSaleScraper()
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
