import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaClient } from '@prisma/client';

import { AppModule } from '../src/app.module';

describe('DishController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    const createDishTypes = async () => {
        await prisma.dishType.createMany({
            data: [
                {
                    id: 1,
                    nameRu: 'Завтрак',
                    nameHe: 'ארוחת בוקר'
                },
                {
                    id: 2,
                    nameRu: 'Обед',
                    nameHe: 'ארוחת צהריים'
                },
                {
                    id: 3,
                    nameRu: 'Ужин',
                    nameHe: 'ארוחת ערב'
                }
            ]
        });
    };

    const createDishes = async () => {
        await prisma.dish.createMany({
            data: [
                {
                    adminName: 'Завтрак 1',
                    nameRu: 'Яичница с беконом',
                    nameHe: 'חביתה עם בייקון',
                    dishTypeId: 1,
                    picture: 'https://example.com/image1.jpg',
                    descriptionRu: 'Яичница с жареным беконом',
                    descriptionHe: 'חביתה עם בייקון',
                    calories: 300,
                    weight: 200,
                    proteins: 15,
                    fats: 20,
                    carbohydrates: 5,
                    price: 150,
                    benefitRu: 'Хороший источник белка.',
                    benefitHe: 'מקור טוב לחלבון.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Завтрак 2',
                    nameRu: 'Овсянка',
                    nameHe: 'דייסת שיבולת שועל',
                    dishTypeId: 1,
                    picture: 'https://example.com/image2.jpg',
                    descriptionRu: 'Овсянка с медом и фруктами',
                    descriptionHe: 'דייסת שיבולת שועל עם דבש ופירות',
                    calories: 150,
                    weight: 250,
                    proteins: 5,
                    fats: 4,
                    carbohydrates: 25,
                    price: 100,
                    benefitRu: 'Полезный завтрак с низким содержанием жира.',
                    benefitHe: 'ארוחת בוקר בריאה עם שומן נמוך.',
                    isPublished: false,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Завтрак 3',
                    nameRu: 'Тосты с авокадо',
                    nameHe: 'טוסטים עם אבוקדו',
                    dishTypeId: 1,
                    picture: 'https://example.com/image7.jpg',
                    descriptionRu: 'Тосты с авокадо и яйцом пашот',
                    descriptionHe: 'טוסטים עם אבוקדו וביצה קשה',
                    calories: 350,
                    weight: 220,
                    proteins: 12,
                    fats: 22,
                    carbohydrates: 30,
                    price: 180,
                    benefitRu:
                        'Полезный завтрак с большим количеством полезных жиров.',
                    benefitHe: 'ארוחת בוקר בריאה עם שומנים טובים.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Обед 1',
                    nameRu: 'Цезарь с курицей',
                    nameHe: 'סלט קיסר עם עוף',
                    dishTypeId: 2,
                    picture: 'https://example.com/image3.jpg',
                    descriptionRu: 'Салат Цезарь с жареным куриным филе',
                    descriptionHe: 'סלט קיסר עם עוף צלוי',
                    calories: 400,
                    weight: 300,
                    proteins: 30,
                    fats: 25,
                    carbohydrates: 15,
                    price: 250,
                    benefitRu: 'Содержит много белка и клетчатки.',
                    benefitHe: 'מכיל הרבה חלבון וסיבים תזונתיים.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Обед 2',
                    nameRu: 'Суп-пюре из тыквы',
                    nameHe: 'מרק פירה מקולורבי',
                    dishTypeId: 2,
                    picture: 'https://example.com/image4.jpg',
                    descriptionRu: 'Легкий суп-пюре с тыквой и специями',
                    descriptionHe: 'מרק פירה עם דלעת ותיבול',
                    calories: 200,
                    weight: 200,
                    proteins: 5,
                    fats: 2,
                    carbohydrates: 40,
                    price: 120,
                    benefitRu: 'Отлично подходит для легкого обеда.',
                    benefitHe: 'מתאים לארוחת צהריים קלה.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Обед 3',
                    nameRu: 'Паста с томатным соусом',
                    nameHe: 'פסטה עם רוטב עגבניות',
                    dishTypeId: 2,
                    picture: 'https://example.com/image8.jpg',
                    descriptionRu:
                        'Паста с ароматным томатным соусом и базиликом',
                    descriptionHe: 'פסטה עם רוטב עגבניות וריחני ובזיליקום',
                    calories: 500,
                    weight: 350,
                    proteins: 15,
                    fats: 10,
                    carbohydrates: 80,
                    price: 220,
                    benefitRu: 'Простое и сытное блюдо для обеда.',
                    benefitHe: 'מנה פשוטה ומשביעה לארוחת צהריים.',
                    isPublished: false,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Ужин 1',
                    nameRu: 'Стейк с картофелем',
                    nameHe: 'סטייק עם תפוחי אדמה',
                    dishTypeId: 3,
                    picture: 'https://example.com/image5.jpg',
                    descriptionRu: 'Стейк из говядины с картофельным пюре',
                    descriptionHe: 'סטייק בקר עם פירה תפוחי אדמה',
                    calories: 600,
                    weight: 350,
                    proteins: 40,
                    fats: 30,
                    carbohydrates: 20,
                    price: 350,
                    benefitRu: 'Источник белка и железа.',
                    benefitHe: 'מקור לחלבון וברזל.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                },
                {
                    adminName: 'Ужин 2',
                    nameRu: 'Рыба с овощами',
                    nameHe: 'דג עם ירקות',
                    dishTypeId: 3,
                    picture: 'https://example.com/image6.jpg',
                    descriptionRu: 'Запеченная рыба с гарниром из овощей',
                    descriptionHe: 'דג אפוי עם תוספת ירקות',
                    calories: 450,
                    weight: 300,
                    proteins: 35,
                    fats: 15,
                    carbohydrates: 25,
                    price: 300,
                    benefitRu: 'Полезный ужин с низким содержанием жира.',
                    benefitHe: 'ארוחת ערב בריאה עם שומן נמוך.',
                    isPublished: true,
                    isIndividualOrderAvailable: true
                }
            ]
        });
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = new PrismaClient();

        await prisma.dishType.deleteMany();

        await createDishTypes();
        await createDishes();
    });

    afterAll(async () => {
        await prisma.dishType.deleteMany();
        await app.close();
    });

    describe('Dish types', () => {
        it('/dish/type (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish/type'
            );

            expect(response.status).toBe(200);

            const dishTypes = response.body.dishTypes;

            expect(dishTypes).toHaveLength(3);
            expect(dishTypes[0].name.ru).toBe('Завтрак');
            expect(dishTypes[0].name.he).toBe('ארוחת בוקר');

            dishTypes.forEach(dishType => {
                expect(dishType).toHaveProperty('id');
                const name = dishType.name;
                expect(name).toHaveProperty('ru');
                expect(name).toHaveProperty('he');
            });
        });
    });

    describe('Dishes', () => {
        it('/dish (GET)', async () => {
            const response = await request(app.getHttpServer()).get('/dish');

            expect(response.status).toBe(200);

            const body = response.body;

            expect(body).toHaveProperty('dishes');
            expect(body).toHaveProperty('totalCount');
            expect(body).toHaveProperty('page');
            expect(body).toHaveProperty('totalPages');
            expect(body).toHaveProperty('isLast');

            expect(typeof body.dishes).toBe('object');
            expect(typeof body.totalCount).toBe('number');
            expect(typeof body.page).toBe('number');
            expect(typeof body.totalPages).toBe('number');
            expect(typeof body.isLast).toBe('boolean');

            expect(body.totalCount).toBe(6);
            expect(body.page).toBe(1);
            expect(body.totalPages).toBe(2);
            expect(body.isLast).toBe(false);

            const dishes = body.dishes;

            expect(dishes).toHaveLength(5);

            dishes.forEach(dish => {
                expect(dish).toHaveProperty('id');
                expect(dish).toHaveProperty('adminName');
                expect(dish).toHaveProperty('dishType');
                expect(dish).toHaveProperty('picture');
                expect(dish).toHaveProperty('calories');
                expect(dish).toHaveProperty('weight');
                expect(dish).toHaveProperty('proteins');
                expect(dish).toHaveProperty('fats');
                expect(dish).toHaveProperty('carbohydrates');
                expect(dish).toHaveProperty('price');
                expect(dish).toHaveProperty('isPublished');
                expect(dish).toHaveProperty('isIndividualOrderAvailable');
                expect(dish).toHaveProperty('name');
                expect(dish).toHaveProperty('description');
                expect(dish).toHaveProperty('benefit');
                expect(dish).toHaveProperty('createdAt');
                expect(dish).toHaveProperty('updatedAt');

                expect(typeof dish.id).toBe('number');
                expect(typeof dish.adminName).toBe('string');
                expect(typeof dish.picture).toBe('string');
                expect(typeof dish.calories).toBe('number');
                expect(typeof dish.weight).toBe('number');
                expect(typeof dish.proteins).toBe('number');
                expect(typeof dish.fats).toBe('number');
                expect(typeof dish.carbohydrates).toBe('number');
                expect(typeof dish.price).toBe('number');
                expect(typeof dish.isPublished).toBe('boolean');
                expect(typeof dish.isIndividualOrderAvailable).toBe('boolean');

                expect(dish.dishType).toHaveProperty('id');
                expect(dish.dishType).toHaveProperty('name');
                expect(typeof dish.dishType.id).toBe('number');
                expect(dish.dishType.name).toHaveProperty('ru');
                expect(dish.dishType.name).toHaveProperty('he');
                expect(typeof dish.dishType.name.ru).toBe('string');
                expect(typeof dish.dishType.name.he).toBe('string');

                expect(dish.name).toHaveProperty('ru');
                expect(dish.name).toHaveProperty('he');
                expect(typeof dish.name.ru).toBe('string');
                expect(typeof dish.name.he).toBe('string');

                expect(dish.description).toHaveProperty('ru');
                expect(dish.description).toHaveProperty('he');
                expect(typeof dish.description.ru).toBe('string');
                expect(typeof dish.description.he).toBe('string');

                expect(dish.benefit).toHaveProperty('ru');
                expect(dish.benefit).toHaveProperty('he');
                expect(typeof dish.benefit.ru).toBe('string');
                expect(typeof dish.benefit.he).toBe('string');

                expect(typeof dish.createdAt).toBe('string');
                expect(typeof dish.updatedAt).toBe('string');
            });
        });

        it('/dish?page=2&limit=2 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?page=2&limit=2'
            );

            const body = response.body;

            expect(body.totalCount).toBe(6);
            expect(body.page).toBe(2);
            expect(body.totalPages).toBe(3);
            expect(body.isLast).toBe(false);

            expect(body.dishes).toHaveLength(2);
        });

        it('/dish?page=2&limit=4 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?page=2&limit=4'
            );

            const body = response.body;

            expect(body.totalCount).toBe(6);
            expect(body.page).toBe(2);
            expect(body.totalPages).toBe(2);
            expect(body.isLast).toBe(true);

            expect(body.dishes).toHaveLength(2);
        });

        it('/dish?page=2&limit=6 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?page=2&limit=6'
            );

            const body = response.body;

            expect(body.totalCount).toBe(6);
            expect(body.page).toBe(2);
            expect(body.totalPages).toBe(1);
            expect(body.isLast).toBe(true);

            expect(body.dishes).toHaveLength(0);
        });

        it('/dish?page=0 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?page=0'
            );

            expect(response.status).toBe(500);
        });

        it('/dish?dish_type_id=1 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?dish_type_id=1'
            );

            const body = response.body;

            expect(body.totalCount).toBe(2);
            expect(body.page).toBe(1);
            expect(body.totalPages).toBe(1);
            expect(body.isLast).toBe(true);

            expect(body.dishes).toHaveLength(2);
        });

        it('/dish?dish_type_id=4 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?dish_type_id=4'
            );

            const body = response.body;

            expect(body.totalCount).toBe(0);
            expect(body.page).toBe(1);
            expect(body.totalPages).toBe(0);
            expect(body.isLast).toBe(true);

            expect(body.dishes).toHaveLength(0);
        });

        it('/dish?dish_type_id=1&page=2&limit=1 (GET)', async () => {
            const response = await request(app.getHttpServer()).get(
                '/dish?dish_type_id=1&page=2&limit=1'
            );

            const body = response.body;

            expect(body.totalCount).toBe(2);
            expect(body.page).toBe(2);
            expect(body.totalPages).toBe(2);
            expect(body.isLast).toBe(true);

            expect(body.dishes).toHaveLength(1);
        });
    });
});
