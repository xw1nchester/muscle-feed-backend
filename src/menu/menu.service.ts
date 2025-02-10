import {
    BadGatewayException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { MenuType } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { MenuTypeRequestDto } from '@admin/menu/dto/menu-type-request.dto';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class MenuService {
    constructor(private readonly prismaService: PrismaService) {}

    private get menuRepository() {
        return this.prismaService.menu;
    }

    private get menuTypeRepository() {
        return this.prismaService.menuType;
    }

    async getTypeById(id: number) {
        const type = await this.menuTypeRepository.findFirst({
            where: { id },
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        if (!type) {
            throw new NotFoundException('Тип меню не найден');
        }

        return type;
    }

    createTypeDto(type: MenuType, menusCount: number = 0) {
        const { id, adminName, backgroundPicture, order, isPublished } = type;

        const localizedFields = extractLocalizedFields(type);

        return {
            id,
            adminName,
            backgroundPicture,
            order,
            isPublished,
            ...localizedFields,
            menusCount
        };
    }

    async createType(dto: MenuTypeRequestDto) {
        const createdType = await this.menuTypeRepository.create({
            data: dto
        });

        return { menuType: this.createTypeDto(createdType) };
    }

    async getTypes(isPublished?: boolean) {
        const where = { ...(isPublished != undefined && { isPublished }) };

        const typesData = await this.menuTypeRepository.findMany({
            where,
            include: {
                _count: {
                    select: { menus: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        const menuTypes = typesData.map(type =>
            this.createTypeDto(type, type._count.menus)
        );

        return { menuTypes };
    }

    async getTypeDtoById(id: number) {
        const type = await this.getTypeById(id);

        return { menuType: this.createTypeDto(type, type._count.menus) };
    }

    async updateType(id: number, dto: MenuTypeRequestDto) {
        await this.getTypeById(id);

        const updatedType = await this.menuTypeRepository.update({
            where: { id },
            data: dto,
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        return {
            menuType: this.createTypeDto(updatedType, updatedType._count.menus)
        };
    }

    async deleteType(id: number) {
        const existingType = await this.getTypeById(id);

        if (existingType._count.menus > 0) {
            throw new BadGatewayException(
                'Нельзя удалить тип меню, так как есть меню с этим типом'
            );
        }

        await this.menuTypeRepository.delete({ where: { id } });

        return {
            menuType: this.createTypeDto(existingType)
        };
    }
}
