import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { BeforeAfterService } from '@before-after/before-after.service';

import { BeforeAfterRequestDto } from './dto/before-after-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.MODERATOR)
@Controller('admin/before-after')
export class BeforeAfterController {
    constructor(private readonly beforeAfterService: BeforeAfterService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('published', new ParseBoolPipe({ optional: true }))
        isPublished: boolean
    ) {
        return await this.beforeAfterService.find({
            page,
            limit,
            isPublished
        });
    }

    @Post()
    async create(@Body() dto: BeforeAfterRequestDto) {
        return await this.beforeAfterService.adminCreate(dto);
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.beforeAfterService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: BeforeAfterRequestDto
    ) {
        return this.beforeAfterService.update(id, dto);
    }

    @Patch(':id/toggle-publish')
    async togglePublish(@Param('id', ParseIntPipe) id: number) {
        return this.beforeAfterService.togglePublish(id);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.beforeAfterService.delete(id);
    }
}
