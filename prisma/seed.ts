import prisma from '@/utils/database/prisma';

const Tags = [
    { name: '大前端', alias: 'frontEnds' },
    { name: '区块链', alias: 'blockchain' },
    { name: '投资理财', alias: 'investment' },
    { name: '外语学习', alias: 'foreignLang' },
    { name: '人工智能', alias: 'ai' },
];
const Categories = [
    { name: '工程技术', alias: 'projTech' },
    { name: '企业管理', alias: 'management' },
    { name: '科技杂志', alias: 'magazines' },
    { name: '外语教材', alias: 'materials' },
    { name: '人文社科', alias: 'humanities' },
];

const Users = [
    {
        name: 'tomartisan',
        age: 30,
        email: 'hello@tangkunyin.com',
        avatar: 'https://tangkunyin.com/images/avatar.webp',
        bio: 'Fullstack developer, familiar with typescript/kotlin/swift/golang, good at mobile apps development, a tittle understanding about backend. Likes reading, swimming, basketball and traveling. My dream is write the code and change the world.',
    },
    {
        name: 'Lucas',
        age: 3,
        email: 'itomartisan@google.com',
        avatar: 'https://hello.tangkunyin.com/avatars.png',
        bio: 'An AI Assistant for Mr Tomartisan',
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
        id: 'fc20069fa25bd07537eae8559fde792dff9d944288bc3c2ecbc8785ea98bc211',
        title: 'Insert test tags',
        description: 'Milvus Guildline,What is Milvus?,Everything you need to know about Milvus in less than 10 minutes.',
        keywords: ['Milvus', 'Guildline'],
        categoryId: 1,
        userId: 1,
        authors: ['thomas', 'kevin'],
        coverUrl: 'https://mn.tangkunyin.com/assets/ideal-img/hero.cae8a08.1080.png',
        tags: {
            // 创建时，自动校验关联关系，如果有、则绑定，否则创建并绑定
            connectOrCreate: [
                {
                    where: { id: 0 },
                    create: { name: '大模型', alias: 'llm' },
                },
                {
                    where: { id: 5 },
                    create: { name: '', alias: '' },
                },
            ],
        },
    },
};

async function seedData() {
    console.time('seedingData costs:');
    const tableName = AnyModel.model.toLowerCase();
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
