import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: [
            {
                level: 'query',
                emit: 'event',
            },
            {
                level: 'error',
                emit: 'stdout',
            },
            {
                level: 'info',
                emit: 'stdout',
            },
            {
                level: 'warn',
                emit: 'stdout',
            },
        ],
    });
    return prisma;
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
