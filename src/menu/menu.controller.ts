import { Controller, Get } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { MenuService } from './menu.service';

@Public()
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Get('type')
    async getTypes() {
        return await this.menuService.getTypes(true);
    }
}
