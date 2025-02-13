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
import { FaqService } from '@faq/faq.service';

import { FaqCategoryRequestDto } from './dto/faq-category-request.dto';
import { FaqRequestDto } from './dto/faq-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    @Post('category')
    async createCategory(@Body() dto: FaqCategoryRequestDto) {
        return await this.faqService.createCategory(dto);
    }

    @Get('category/:id')
    async getCategoryDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.faqService.getCategoryDtoById(id);
    }

    @Patch('category/:id')
    async updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FaqCategoryRequestDto
    ) {
        return await this.faqService.updateCategory(id, dto);
    }

    @Delete('category/:id')
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return await this.faqService.deleteCategory(id);
    }

    @Post()
    async create(@Body() dto: FaqRequestDto) {
        return await this.faqService.create(dto);
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.faqService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FaqRequestDto
    ) {
        return await this.faqService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.faqService.delete(id);
    }
}
