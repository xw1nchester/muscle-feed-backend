import { Controller, Get } from '@nestjs/common';

import { Public } from '@auth/decorators';

@Controller()
export class AppController {
    @Public()
    @Get('ping')
    getHello(): string {
        return 'pong';
    }
}
