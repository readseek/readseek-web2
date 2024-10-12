import prisma from '@/utils/database/prisma';

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

async function seedData() {
    console.time('seedingData costs:');

    for (const data of Tags) {
        const result = await prisma.tag.create({
            data,
        });
        console.log(`Created tag with id: ${result.id}`);
    }

    for (const data of Categories) {
        const result = await prisma.category.create({
            data,
        });
        console.log(`Created category with id: ${result.id}`);
    }

    for (const data of Users) {
        const result = await prisma.user.create({
            data,
        });
        console.log(`Created user with id: ${result.id}`);
    }

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
