import { genSaltSync, hashSync } from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Language, PrismaClient } from '@prisma/client';

import { MailService } from '@mail/mail.service';

import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    const mockMailService = {
        sendVerificationCode: jest.fn().mockResolvedValue(undefined)
    };

    const validUser = {
        id: 1,
        email: 'loginuser@example.com',
        password: 'Password123!'
    };

    const createUsers = async () => {
        await prisma.user.createMany({
            data: [
                {
                    id: validUser.id,
                    email: validUser.email,
                    password: hashSync(validUser.password, genSaltSync(10)),
                    isVerified: true,
                    roles: [],
                    language: 'HE',
                    firstName: 'Yael',
                    lastName: 'Cohen',
                    phone: '+972555123456',
                    allergies: 'Gluten'
                },
                {
                    id: 2,
                    email: 'admin@example.com',
                    password: 'hashedpassword1',
                    isVerified: true,
                    roles: ['ADMIN'],
                    language: 'RU',
                    firstName: 'Admin',
                    lastName: 'User',
                    phone: '+1234567890',
                    allergies: null
                },
                {
                    id: 3,
                    email: 'moderator@example.com',
                    password: 'hashedpassword2',
                    isVerified: true,
                    roles: ['MODERATOR'],
                    language: 'HE',
                    firstName: 'Mod',
                    lastName: 'Erator',
                    phone: '+1111111111',
                    allergies: 'Peanuts'
                },
                {
                    id: 4,
                    email: 'god@gmail.com',
                    password: 'hashedpassword1',
                    isVerified: true,
                    roles: ['ADMIN', 'MODERATOR'],
                    language: 'RU',
                    firstName: 'God',
                    lastName: null,
                    phone: '+1234567890',
                    allergies: null
                },
                {
                    id: 5,
                    email: 'user1@example.com',
                    password: 'hashedpassword3',
                    isVerified: false,
                    roles: [],
                    language: 'RU',
                    firstName: 'Ivan',
                    lastName: 'Petrov',
                    phone: null,
                    allergies: null
                }
            ]
        });
    };

    const createTokens = async () => {
        await prisma.token.createMany({
            data: [
                {
                    token: 'valid-refresh-token',
                    userId: validUser.id,
                    expiryDate: new Date(Date.now() + 1000 * 60 * 60), // +1ч
                    userAgent: 'Mozilla/5.0 (TestAgent)'
                },
                {
                    token: 'expired-refresh-token',
                    userId: validUser.id,
                    expiryDate: new Date(Date.now() - 1000 * 60 * 60), // -1ч
                    userAgent: 'Mozilla/5.0 (TestAgent)'
                }
            ]
        });
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(MailService)
            .useValue(mockMailService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                forbidNonWhitelisted: true,
                whitelist: true
            })
        );
        app.use(cookieParser());
        await app.init();

        prisma = new PrismaClient();

        await prisma.user.deleteMany();

        await createUsers();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await app.close();
    });

    beforeEach(async () => {
        await prisma.token.deleteMany();
        await createTokens();
    });

    it('Should register a new user successfully', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
                language: Language.RU
            })
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/refresh-token=.*HttpOnly/)
            ])
        );
    });

    it('Should return error if email is already registered', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'user1@example.com',
                password: 'anotherpass',
                language: Language.HE
            })
            .expect(400);

        expect(response.body.message).toEqual(
            expect.objectContaining({
                ru: expect.stringMatching(/уже зарегистрирован/)
            })
        );
    });

    it('Should return error if email is invalid', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'not-an-email',
                password: 'validPassword123',
                language: Language.RU
            })
            .expect(400);

        expect(response.body.message).toContain('email must be an email');
    });

    it('Should return error if password is too short', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'newuser@example.com',
                password: '123',
                language: Language.HE
            })
            .expect(400);

        expect(response.body.message).toContain(
            'password must be longer than or equal to 8 characters'
        );
    });

    it('Should login successfully with valid credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: validUser.email,
                password: validUser.password
            })
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/refresh-token=.*HttpOnly/)
            ])
        );
    });

    it('Should fail login with wrong password', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: validUser.email,
                password: 'WrongPassword'
            })
            .expect(400);

        expect(response.body.message).toMatchObject({
            ru: expect.stringMatching(/Неверное имя пользователя/)
        });
    });

    it('Should fail login with non-existing user', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'notfound@example.com',
                password: 'SomePassword123'
            })
            .expect(400);
    });

    it('Should return validation error if email is empty', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: '',
                password: 'Password123!'
            })
            .expect(400);

        expect(response.body.message).toContain('email must be an email');
    });

    it('Should return validation error if password is too short', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: validUser.email,
                password: '123'
            })
            .expect(400);

        expect(response.body.message).toContain(
            'password must be longer than or equal to 8 characters'
        );
    });

    it('Should refresh token and return new access token', async () => {
        const response = await request(app.getHttpServer())
            .get('/auth/refresh')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .set('Cookie', ['refresh-token=valid-refresh-token'])
            .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/refresh-token=.*HttpOnly/)
            ])
        );
    });

    it('Should return 401 if refresh token is missing', async () => {
        await request(app.getHttpServer())
            .get('/auth/refresh')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .expect(401);
    });

    it('Should return 401 if token is not found', async () => {
        await request(app.getHttpServer())
            .get('/auth/refresh')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .set('Cookie', [`refresh-token=invalid-token-123`])
            .expect(401);
    });

    it('Should return 401 if token is expired', async () => {
        await request(app.getHttpServer())
            .get('/auth/refresh')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .set('Cookie', [`refresh-token=expired-refresh-token`])
            .expect(401);
    });
});
