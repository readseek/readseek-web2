import prisma from '@/utils/database/prisma';

const Categories = [
    { name: '人工智能', alias: 'ai' },
    { name: '编程技术', alias: 'coding' },
    { name: '产品设计', alias: 'prodes' },
    { name: '投资理财', alias: 'investment' },
    { name: '企业管理', alias: 'management' },
    { name: '科技杂志', alias: 'magazines' },
    { name: '外语教材', alias: 'materials' },
    { name: '人文社科', alias: 'humanities' },
];

const Tags = [
    { name: '语言', alias: 'language' },
    { name: '历史', alias: 'history' },
    { name: '自传', alias: 'autobiography' },
    { name: '经济', alias: 'economy' },
    { name: '金融', alias: 'finance' },
    { name: '科技', alias: 'technology' },
    { name: '旅行', alias: 'traveling' },
    { name: '干货', alias: 'practicals' },
    { name: '框架', alias: 'frameworks' },
    { name: '架构', alias: 'infrastructure' },
    { name: '生产力', alias: 'productivity' },
    { name: '大模型', alias: 'llm' },
    { name: '区块链', alias: 'blockChain' },
    { name: '自媒体', alias: 'selfMedia' },
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

const AnyModel = {
    model: 'Document',
    data: {
        id: 'fc20069fa25bd07537eae8559fde792dff9d944288bc3c2ecbc8785ea98bc211',
        title: 'Insert test tags',
        description: 'Milvus Guildline,What is Milvus?,Everything you need to know about Milvus in less than 10 minutes.',
        keywords: ['Milvus', 'Guildline'],
        type: 'PDF',
        categoryId: 1,
        userId: 1,
        authors: ['thomas', 'kevin'],
        coverUrl: 'http://localhost:4455/assets/text-files.svg',
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

async function seedData() {
    console.time('seedingData costs:');
    const tableName = AnyModel.model.toLowerCase();
    const ret: any = await prisma.document.create({
        data: AnyModel.data,
    });
    // const ret: any = await prisma.document.upsert({
    //     data: AnyModel.data,
    // });
    console.log(`Created ${tableName} with id: ${ret.id}`, ret);
    console.timeEnd('seedingData costs:');
}

async function queryAll() {
    const ret: any = await prisma.tag.findMany({
        select: {
            id: true,
            name: true,
        },
        where: {
            AND: [
                {
                    name: {
                        not: {
                            equals: '',
                        },
                    },
                },
                {
                    name: {
                        not: undefined,
                    },
                },
            ],
        },
    });
    console.log('queryAll: ', ret);
}

async function deleteData(id?: string) {
    const ret: any = await prisma.document.deleteMany({
        where: {
            id,
        },
    });
    console.log('deleteData: ', ret);
}

async function queryOneData(id: string) {
    const ret: any = await prisma.document.findUnique({
        select: {
            title: true,
            description: true,
            keywords: true,
            authors: true,
            coverUrl: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true,
            category: {
                select: {
                    name: true,
                },
            },
            tags: {
                select: {
                    name: true,
                },
            },
            user: {
                select: {
                    name: true,
                    email: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                },
            },
        },
        where: { id },
    });
    console.log('deleteData: ', ret);
}

(async () => {
    try {
        // await seedMetaData();

        // await seedData();
        // await queryAll();
        // await deleteData('116897deb02eb7808caec6919da913824d933dc548763443be5653cdbe7a46c4');

        await queryOneData('ec20069fa25bd07537eae8559fde792dff9d944288bc3c2ecbc8785ea98bc5c8');
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
})();
