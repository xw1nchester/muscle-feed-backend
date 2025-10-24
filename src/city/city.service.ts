import { Injectable, NotFoundException } from '@nestjs/common';

import { City } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { CityRequestDto } from '@admin/city/dto/city-request.dto';
import { RedisService } from '@redis/redis.service';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class CityService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService
    ) {}

    private get cityRepository() {
        return this.prismaService.city;
    }

    async getById(id: number) {
        const city = await this.cityRepository.findFirst({ where: { id } });

        if (!city) {
            throw new NotFoundException('Город не найден');
        }

        return city;
    }

    createDto(city: City) {
        const localizedFields = extractLocalizedFields(city);

        return {
            id: city.id,
            code: city.code,
            ...localizedFields
        };
    }

    async create(dto: CityRequestDto) {
        const createdCity = await this.cityRepository.create({ data: dto });

        await this.redisService.del('cities');

        return { city: this.createDto(createdCity) };
    }

    async getDtoById(id: number) {
        const existingCity = await this.getById(id);

        return { city: this.createDto(existingCity) };
    }

    async update(id: number, dto: CityRequestDto) {
        await this.getById(id);

        if (!dto.code) dto.code = null;

        const updatedCity = await this.cityRepository.update({
            where: { id },
            data: dto
        });

        await this.redisService.del('cities');

        return { city: this.createDto(updatedCity) };
    }

    async delete(id: number) {
        const existingCity = await this.getById(id);

        await this.cityRepository.delete({ where: { id } });

        await this.redisService.del('cities');

        return { city: this.createDto(existingCity) };
    }

    async find() {
        const citiesData = await this.cityRepository.findMany({
            orderBy: { id: 'asc' }
        });

        const cities = citiesData.map(city => this.createDto(city));

        return { cities };
    }
}
