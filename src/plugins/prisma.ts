import { PrismaClient } from '@prisma/client';

const mockedPrismaClient = new (<new () => PrismaClient>(
    PrismaClient
))() as jest.Mocked<PrismaClient>;

const prismaClient = new PrismaClient();

// To use mocked prisma client for testing
export const prisma = process.env.NODE_ENV === 'test' ? mockedPrismaClient : prismaClient;
