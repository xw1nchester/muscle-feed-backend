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
import { CityService } from '@city/city.service';

import { CityRequestDto } from './dto/city-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/city')
export class CityController {
    constructor(private readonly cityService: CityService) {}

    @Post()
    async create(@Body() dto: CityRequestDto) {
        return await this.cityService.create(dto);
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.cityService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CityRequestDto
    ) {
        return await this.cityService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.cityService.delete(id);
    }
}
