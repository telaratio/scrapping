import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  try {
    const users = await prisma.utilisateur.findMany();
    return {
      users
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return {
      users: []
    };
  }
}

