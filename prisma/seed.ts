import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    const dishTypes = [
        {
            id: 1,
            nameRu: 'Завтрак',
            nameHe: 'ארוחת בוקר'
        },
        {
            id: 2,
            nameRu: 'Второй завтрак',
            nameHe: 'ארוחת בוקר שנייה'
        },
        {
            id: 3,
            nameRu: 'Обед',
            nameHe: 'ארוחת צהריים'
        },
        {
            id: 4,
            nameRu: 'Полдник',
            nameHe: 'ארוחת מנחה'
        },
        {
            id: 5,
            nameRu: 'Ужин',
            nameHe: 'ארוחת ערב'
        },
        {
            id: 6,
            nameRu: 'Напиток',
            nameHe: 'שתייה'
        }
    ];

    for (const { id, nameRu, nameHe } of dishTypes) {
        const dishType = await prisma.dishType.upsert({
            where: { id },
            update: {
                nameRu,
                nameHe
            },
            create: {
                id,
                nameRu,
                nameHe
            }
        });

        console.log('Seeded dishType:', dishType);
    }

    console.log('Seeding finished.');
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
