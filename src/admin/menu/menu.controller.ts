import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { MenuService } from '@menu/menu.service';

import { MenuRequestDto } from './dto/menu-request.dto';
import { MenuTypeRequestDto } from './dto/menu-type-request.dto';
import { ValidateMenuPipe } from './pipes/validate-menu.pipe';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Post('type')
    async createType(@Body() dto: MenuTypeRequestDto) {
        return await this.menuService.createType(dto);
    }

    @Get('type')
    async getTypes() {
        return await this.menuService.getTypes();
    }

    @Get('type/:id')
    async getTypeDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.menuService.getTypeDtoById(id);
    }

    @Patch('type/:id')
    async updateType(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: MenuTypeRequestDto
    ) {
        return await this.menuService.updateType(id, dto);
    }

    @Delete('type/:id')
    async deleteType(@Param('id', ParseIntPipe) id: number) {
        return await this.menuService.deleteType(id);
    }

    @Post()
    async create(@Body(ValidateMenuPipe) dto: MenuRequestDto) {
        return await this.menuService.create(dto);
    }
}
