import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

import { PromocodeRequestDto } from '@admin/promocode/dto/promocode-request.dto';
import { PaginationDto } from '@dto/pagination.dto';

@Injectable()
export class PromocodeService {
    constructor(private readonly prismaService: PrismaService) {}

    async getById(id: number) {
        const promocode = await this.prismaService.promocode.findFirst({
            where: { id }
        });

        if (!promocode) {
            throw new NotFoundException('Промокод не найден');
        }

        return promocode;
    }

    async create({ code, discount }: PromocodeRequestDto) {
        const existingPromocode = await this.prismaService.promocode.findFirst({
            where: { code }
        });

        if (existingPromocode) {
            throw new BadRequestException('Данный промокод уже существует');
        }

        const createdPromocode = await this.prismaService.promocode.create({
            data: { code, discount }
        });

        return { promocode: createdPromocode };
    }

    async find(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const promocodes = await this.prismaService.promocode.findMany({
            orderBy: { id: 'desc' },
            take: limit,
            skip
        });

        const totalCount = await this.prismaService.promocode.count();

        return new PaginationDto(
            'promocodes',
            promocodes,
            totalCount,
            limit,
            page
        );
    }

    async getDtoById(id: number) {
        const existingPromocode = await this.getById(id);

        return { promocode: existingPromocode };
    }

    async update(id: number, { code, discount }: PromocodeRequestDto) {
        await this.getById(id);

        const existingPromocode = await this.prismaService.promocode.findFirst({
            where: { id: { not: id }, code }
        });

        if (existingPromocode) {
            throw new BadRequestException('Данный промокод уже существует');
        }

        const updatedPromocode = await this.prismaService.promocode.update({
            where: { id },
            data: { code, discount }
        });

        return { promocode: updatedPromocode };
    }

    async delete(id: number) {
        const existingPromocode = await this.getById(id);

        await this.prismaService.promocode.delete({ where: { id } });

        return { promocode: existingPromocode };
    }

    private calculatePrice(price: number, discount: number) {
        const finalPrice = price * (1 - discount / 100);

        return Math.round(finalPrice / 10) * 10;
    }

    async getByCodeAndCalculatePrice(code: string, price: number) {
        const existingPromocode = await this.prismaService.promocode.findFirst({
            where: { code: { equals: code, mode: 'insensitive' } }
        });

        if (!existingPromocode) {
            throw new NotFoundException({
                message: { ru: 'Промокод не найден', he: 'קוד פרומו לא נמצא' }
            });
        }

        return {
            promocode: existingPromocode,
            finalPrice: this.calculatePrice(price, existingPromocode.discount)
        };
    }

    async calculatePriceById(id: number, price: number) {
        const { discount } = await this.getById(id);

        return this.calculatePrice(price, discount);
    }
}
