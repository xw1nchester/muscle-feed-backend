import { join } from 'path';

import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { createKeyv } from '@keyv/redis';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CityModule } from './city/city.module';
import { CodeModule } from './code/code.module';
import { DishModule } from './dish/dish.module';
import { FaqModule } from './faq/faq.module';
import { LoggerMiddleware } from './logger.midleware';
import { MailModule } from './mail/mail.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromocodeModule } from './promocode/promocode.module';
import { RedisModule } from './redis/redis.module';
import { ReviewModule } from './review/review.module';
import { SettingsModule } from './settings/settings.module';
import { TeamModule } from './team/team.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const host = configService.get('REDIS_HOST');
                const port = configService.get('REDIS_PORT');
                return {
                    stores: [createKeyv(`redis://${host}:${port}`)],
                    ttl: 5000
                };
            }
        }),
        ServeStaticModule.forRoot({
            serveRoot: '/static',
            rootPath: join(__dirname, '..', 'uploads')
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        MailModule,
        CodeModule,
        TeamModule,
        AdminModule,
        DishModule,
        UploadModule,
        ReviewModule,
        MenuModule,
        FaqModule,
        CityModule,
        OrderModule,
        PromocodeModule,
        SettingsModule,
        RedisModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
