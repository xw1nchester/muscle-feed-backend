import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { Faq, FaqCategory } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { FaqCategoryRequestDto } from '@admin/faq/dto/faq-category-request.dto';
import { FaqRequestDto } from '@admin/faq/dto/faq-request.dto';
import { UploadService } from '@upload/upload.service';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class FaqService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly uploadService: UploadService
    ) {}

    private get faqCategoryRepository() {
        return this.prismaService.faqCategory;
    }

    private get faqRepository() {
        return this.prismaService.faq;
    }

    // FAQ Category
    async getCategoryById(id: number) {
        const category = await this.faqCategoryRepository.findFirst({
            where: { id },
            include: { _count: { select: { faq: true } } }
        });

        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return category;
    }

    createCategoryDto(category: FaqCategory, faqCount: number = 0) {
        const { id, picture, createdAt, updatedAt } = category;

        const localizedFields = extractLocalizedFields(category);

        return {
            id,
            picture,
            ...localizedFields,
            createdAt,
            updatedAt,
            faqCount
        };
    }

    async createCategory(dto: FaqCategoryRequestDto) {
        const createdCategory = await this.faqCategoryRepository.create({
            data: dto
        });

        return { faqCategory: this.createCategoryDto(createdCategory) };
    }

    async findCategories() {
        const categoriesData = await this.faqCategoryRepository.findMany({
            orderBy: { createdAt: 'asc' },
            include: { _count: { select: { faq: true } } }
        });

        const faqCategories = categoriesData.map(category =>
            this.createCategoryDto(category, category._count.faq)
        );

        return { faqCategories };
    }

    async getCategoryDtoById(id: number) {
        const existingCategory = await this.getCategoryById(id);

        return {
            faqCategory: this.createCategoryDto(
                existingCategory,
                existingCategory._count.faq
            )
        };
    }

    async updateCategory(id: number, dto: FaqCategoryRequestDto) {
        await this.getCategoryById(id);

        const updatedCategory = await this.faqCategoryRepository.update({
            where: { id },
            data: dto
        });

        return { faqCategory: this.createCategoryDto(updatedCategory) };
    }

    async deleteCategory(id: number) {
        const existingCategory = await this.getCategoryById(id);

        if (existingCategory._count.faq > 0) {
            throw new BadRequestException(
                'Нельзя удалить категорию, так как есть FAQ с ней'
            );
        }

        await this.faqCategoryRepository.delete({ where: { id } });

        this.uploadService.delete(existingCategory.picture);

        return { faqCategory: this.createCategoryDto(existingCategory) };
    }

    // FAQ
    async getById(id: number) {
        const faq = await this.faqRepository.findFirst({
            where: { id },
            include: { faqCategory: true }
        });

        if (!faq) {
            throw new NotFoundException('FAQ не найден');
        }

        return faq;
    }

    createDto(faq: Faq & { faqCategory: FaqCategory }) {
        const { id, createdAt, updatedAt, faqCategory } = faq;

        const localizedFields = extractLocalizedFields(faq);

        return {
            id,
            ...localizedFields,
            faqCategory: this.createCategoryDto(faqCategory),
            createdAt,
            updatedAt
        };
    }

    async create(dto: FaqRequestDto) {
        await this.getCategoryById(dto.faqCategoryId);

        const createdFaq = await this.faqRepository.create({
            data: dto,
            include: { faqCategory: true }
        });

        return { faq: this.createDto(createdFaq) };
    }

    async find(faqCategoryId?: number) {
        const where = { ...(faqCategoryId != undefined && { faqCategoryId }) };

        const faqData = await this.faqRepository.findMany({
            where,
            include: { faqCategory: true },
            orderBy: { createdAt: 'asc' }
        });

        const faq = faqData.map(faq => this.createDto(faq));

        return { faq };
    }

    async getDtoById(id: number) {
        const existingFaq = await this.getById(id);

        return { faq: this.createDto(existingFaq) };
    }

    async update(id: number, dto: FaqRequestDto) {
        await this.getById(id);

        const updatedFaq = await this.faqRepository.update({
            where: { id },
            data: dto,
            include: { faqCategory: true }
        });

        return { faq: this.createDto(updatedFaq) };
    }

    async delete(id: number) {
        const existingFaq = await this.getById(id);

        await this.faqRepository.delete({ where: { id } });

        return { faq: this.createDto(existingFaq) };
    }
}
