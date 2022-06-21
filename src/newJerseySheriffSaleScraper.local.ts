import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { runNewJerseySheriffSaleScraper } from './controllers';

config();
const prisma = new PrismaClient();

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
