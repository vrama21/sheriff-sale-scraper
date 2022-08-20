import { PrismaClient } from '@prisma/client';

let db: PrismaClient;
export const getPrismaClient = () => {
  if (db) return db;

  const prismaClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

  return prismaClient;
};
