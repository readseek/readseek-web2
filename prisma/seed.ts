import prisma from '../src/utils/database/prisma';

const Tags = [
    { key: '大前端', value: 0 },
    { key: '区块链', value: 1 },
    { key: '投资', value: 2 },
    { key: '学外语', value: 3 },
    { key: '人工智能', value: 4 },
];
const Categories = [
    { key: '工程技术', value: 0 },
    { key: '企业管理', value: 1 },
    { key: '科技杂志', value: 2 },
    { key: '外语教材', value: 3 },
    { key: '人文社科', value: 4 },
];

const Users = [
    {
        name: 'tomartisan',
        age: 21,
        email: 'hello@tangkunyin.com',
        avatarUrl: 'https://tangkunyin.com/images/avatar.webp',
        bio: 'Fullstack developer, familiar with typescript/kotlin/swift/golang, good at mobile apps development, a tittle understanding about backend. Likes reading, swimming, basketball and traveling. My dream is write the code and change the world.',
    },
];

async function seedMetaData() {
    const metaData = { tag: Tags, category: Categories, user: Users };
    console.time('seedingMetaData costs:');
    Object.keys(metaData).forEach(async (key: string) => {
        for (const data of metaData[key]) {
            const ret: any = await prisma[key].create({
                data,
            });
            console.log(`Created ${key} with id: ${ret.id}`);
        }
    });
    console.timeEnd('seedingMetaData costs:');
}

// seedMetaData()
//     .then(async () => {
//         await prisma.$disconnect();
//     })
//     .catch(async e => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });

const AnyModel = {
    model: 'Document',
    data: {
        id: 'fc20069fa25bd07537eae8559fde792dff9d944288bc3c2ecbc8785ea98bc5c8',
        title: 'What is Milvus',
        description: 'Milvus Guildline,What is Milvus?,Everything you need to know about Milvus in less than 10 minutes.',
        keywords: ['Milvus', 'Guildline'],
        categoryId: 1,
        userId: 1,
        authors: ['tom', 'jack'],
        coverUrl: 'https://mn.tangkunyin.com/assets/ideal-img/hero.cae8a08.1080.png',
        tags: {
            // 创建时，自动校验关联关系，如果有责绑定，否则创建并绑定
            connectOrCreate: [
                {
                    where: { id: 0 },
                    create: { key: '', value: 0 },
                },
                {
                    where: { id: 5 },
                    create: { key: '', value: 0 },
                },
            ],
        },
    },
};

async function seedData() {
    console.time('seedingData costs:');
    const tableName = AnyModel.model.toLowerCase();
    // const ret: any = await prisma[tableName].create({
    const ret: any = await prisma.document.create({
        data: AnyModel.data,
    });
    console.log(`Created ${tableName} with id: ${ret.id}`, ret);
    console.timeEnd('seedingData costs:');
}

seedData()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
