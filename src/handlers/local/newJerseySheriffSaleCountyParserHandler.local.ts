import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { newJerseySheriffSaleCountyParser } from '../../controllers';

async function local() {
  const prisma = new PrismaClient();

  await prisma.$connect();

  await newJerseySheriffSaleCountyParser('Atlantic')
    .catch((error: Error) => {
      console.error(error);

      throw error;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

void local();
