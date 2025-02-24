import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Public } from '@auth/decorators';

@Public()
@Controller()
export class AppController {
    constructor(private readonly configService: ConfigService) {}

    @Get('ping')
    getHello(): string {
        return 'pong';
    }
}
