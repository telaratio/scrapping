import { PrismaClient } from '@prisma/client';

// Création d'une instance unique de PrismaClient
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

export { prisma }; 