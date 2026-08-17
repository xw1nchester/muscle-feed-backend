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
import { PromotionService } from '@promotion/promotion.service';

import { PromotionRequestDto } from './dto/promotion-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/promotion')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('published', new ParseBoolPipe({ optional: true }))
        isPublished: boolean
    ) {
        return await this.promotionService.find({
            page,
            limit,
            isPublished
        });
    }

    @Post()
    async create(@Body() dto: PromotionRequestDto) {
        return await this.promotionService.adminCreate(dto);
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.promotionService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: PromotionRequestDto
    ) {
        return this.promotionService.update(id, dto);
    }

    @Patch(':id/toggle-publish')
    async togglePublish(@Param('id', ParseIntPipe) id: number) {
        return this.promotionService.togglePublish(id);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.promotionService.delete(id);
    }
}
