import { join } from 'path';

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

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
        SettingsModule
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
