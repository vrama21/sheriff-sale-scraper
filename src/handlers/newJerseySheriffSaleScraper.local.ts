import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { runNewJerseySheriffSaleScraper } from '../controllers';

async function local() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  await runNewJerseySheriffSaleScraper()
    .catch((error: Error) => {
      console.error(error);

      throw error;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

void local();
