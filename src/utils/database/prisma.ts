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
    prisma.$on('query', e => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
    });
    return prisma;
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
