import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import * as YAML from 'yamljs';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
        credentials: true,
        origin: configService.get('ALLOWED_ORIGINS').split(',')
    });

    app.use(cookieParser());

    app.setGlobalPrefix('api');

    const swaggerDocument = YAML.load(join(__dirname, '..', 'swagger.yaml'));

    console.log(join(__dirname, '..', 'swagger.yaml'));

    SwaggerModule.setup('api-docs', app, swaggerDocument);

    await app.listen(configService.get('PORT'));
}
bootstrap();
