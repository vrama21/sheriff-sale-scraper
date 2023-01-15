import { config } from 'dotenv';
config();

import { prisma } from '/opt/client';
import { newJerseySheriffSaleCountyParser } from '../../controllers';

async function local() {
  await prisma.$connect();

  await newJerseySheriffSaleCountyParser()
    .catch((error: Error) => {
      console.error(error);

      throw error;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

void local();
