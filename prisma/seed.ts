import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // seeding dish types
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

    // seeding payment methods
    const paymentMethods = [
        {
            id: 1,
            nameRu: 'Картой по телефону, через нашего оператора',
            nameHe: 'כרטיס אשראי באמצעות הטלפון'
        },
        {
            id: 2,
            nameRu: 'Картой курьеру, при получении заказа',
            nameHe: 'בכרטיס אשראי לשליח, ברגע קבלת המשלוח'
        },
        {
            id: 3,
            nameRu: 'Наличными курьеру',
            nameHe: 'מזמן לשליח'
        }
    ];

    for (const { id, nameRu, nameHe } of paymentMethods) {
        const paymentMethod = await prisma.paymentMethod.upsert({
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

        console.log('Seeded paymentMethod:', paymentMethod);
    }

    // seeding settings
    const cycleStartDate = new Date('1970-01-01T00:00:00');
    cycleStartDate.setTime(
        cycleStartDate.getTime() - cycleStartDate.getTimezoneOffset() * 60000
    );

    const settings = {
        cycleStartDate,
        phoneNumber: '0515883719',
        email: 'musclefd@gmail.com'
    };

    await prisma.settings.upsert({
        where: {
            id: 1
        },
        update: {
            ...settings
        },
        create: {
            id: 1,
            ...settings
        }
    });

    console.log('Seeded settings:', settings);

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
