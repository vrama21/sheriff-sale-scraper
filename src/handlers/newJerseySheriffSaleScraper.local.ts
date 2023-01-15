import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { runNewJerseySheriffSaleScraper } from '../controllers';

async function local() {
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
}

void local();
