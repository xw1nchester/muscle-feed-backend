import { genSaltSync, hashSync } from 'bcrypt';

import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { Address, City, Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { UpdateUserDto } from '@admin/user/dto/update-user.dto';
import { RegisterRequestDto } from '@auth/dto/register-request.dto';
import { JwtPayload } from '@auth/interfaces';
import { CityService } from '@city/city.service';
import { PaginationDto } from '@dto/pagination.dto';

import { AddressRequestDto } from './dto/address-request.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cityService: CityService
    ) {}

    async getById(id: number) {
        const user = await this.prismaService.user.findFirst({ where: { id } });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    async getByEmail(email: string) {
        return await this.prismaService.user.findFirst({
            where: { email }
        });
    }

    async create({ email, password, language }: RegisterRequestDto) {
        return await this.prismaService.user.create({
            data: {
                email,
                password: hashSync(password, genSaltSync(10)),
                language
            }
        });
    }

    createDto(user: User) {
        const {
            id,
            email,
            isVerified,
            roles,
            firstName,
            lastName,
            phone,
            allergies
        } = user;

        return {
            id,
            email,
            isVerified,
            roles,
            firstName,
            lastName,
            phone,
            allergies
        };
    }

    async verify(id: number) {
        return await this.prismaService.user.update({
            where: {
                id
            },
            data: { isVerified: true }
        });
    }

    async updatePassword(id: number, password: string) {
        return await this.prismaService.user.update({
            where: {
                id
            },
            data: {
                password: hashSync(password, genSaltSync(10))
            }
        });
    }

    async getDtoById(id: number) {
        const user = await this.getById(id);

        return { user: this.createDto(user) };
    }

    async updateProfile(id: number, dto: ProfileRequestDto) {
        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: dto
        });

        return { user: this.createDto(updatedUser) };
    }

    createAddressDto(address: Address & { city: City }) {
        const { id, city, street, house, floor, apartment, isPrimary } =
            address;

        return {
            id,
            city: this.cityService.createDto(city),
            street,
            house,
            floor,
            apartment,
            isPrimary
        };
    }

    async getAddresses(userId: number) {
        const addresses = await this.prismaService.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: { city: true }
        });

        const primaryAddress = addresses.find(address => address.isPrimary);

        return {
            primary: primaryAddress
                ? this.createAddressDto(primaryAddress)
                : null,
            addresses: addresses.map(address => this.createAddressDto(address))
        };
    }

    async createAddress(userId: number, dto: AddressRequestDto) {
        const addressesCount = await this.prismaService.address.count({
            where: { userId }
        });

        if (addressesCount > 4) {
            throw new BadRequestException({
                message: {
                    ru: 'Превышено максимальное количество адресов (5)',
                    he: 'חריגה ממספר הכתובות המרבי (5)'
                }
            });
        }

        await this.cityService.getById(dto.cityId);

        const createdAddress = await this.prismaService.address.create({
            data: {
                ...dto,
                userId,
                isPrimary: addressesCount === 0
            },
            include: { city: true }
        });

        return { address: this.createAddressDto(createdAddress) };
    }

    async getUserAddress(id: number, userId: number) {
        const address = await this.prismaService.address.findFirst({
            where: {
                id,
                userId
            },
            include: { city: true }
        });

        if (!address) {
            throw new NotFoundException('Адрес не найден');
        }

        return address;
    }

    async updateAddress(
        addressId: number,
        userId: number,
        dto: AddressRequestDto
    ) {
        await this.getUserAddress(addressId, userId);

        await this.cityService.getById(dto.cityId);

        const updatedAddress = await this.prismaService.address.update({
            where: {
                id: addressId
            },
            data: dto,
            include: { city: true }
        });

        return { address: this.createAddressDto(updatedAddress) };
    }

    async deleteAddress(addressId: number, userId: number) {
        const existingAddress = await this.getUserAddress(addressId, userId);

        if (!existingAddress) {
            throw new NotFoundException('Адрес не найден');
        }

        await this.prismaService.address.delete({ where: { id: addressId } });

        const adressesData = await this.prismaService.address.findMany({
            where: { userId }
        });

        if (existingAddress.isPrimary && adressesData.length > 0) {
            await this.prismaService.address.update({
                where: { id: adressesData[0].id },
                data: { isPrimary: true }
            });
        }

        return { address: this.createAddressDto(existingAddress) };
    }

    async togglePrimaryAddress(addressId: number, userId: number) {
        const addresses = await this.prismaService.address.findMany({
            where: { userId }
        });

        const existingAddress = addresses.find(
            address => address.id == addressId
        );

        if (!existingAddress) {
            throw new NotFoundException('Адрес не найден');
        }

        const primaryAddress = addresses.find(address => address.isPrimary);

        if (primaryAddress && primaryAddress.id != addressId) {
            await this.prismaService.address.update({
                where: { id: primaryAddress.id },
                data: { isPrimary: false }
            });
        }

        const updatedAddress = await this.prismaService.address.update({
            where: { id: addressId },
            data: { isPrimary: !existingAddress.isPrimary },
            include: { city: true }
        });

        return { address: this.createAddressDto(updatedAddress) };
    }

    async find(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const usersData = await this.prismaService.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const users = usersData.map(user => this.createDto(user));

        const totalCount = await this.prismaService.user.count();

        return new PaginationDto('users', users, totalCount, limit, page);
    }

    async update(id: number, dto: UpdateUserDto, admin: JwtPayload) {
        const existingUser = await this.getById(id);

        if (
            existingUser.isVerified &&
            !dto.isVerified &&
            existingUser.roles.includes(Role.ADMIN)
        ) {
            throw new BadRequestException(
                'Нельзя выполнить это действие на администраторе'
            );
        }

        if (
            admin.id == existingUser.id &&
            admin.roles.includes(Role.ADMIN) &&
            !dto.roles.includes(Role.ADMIN)
        ) {
            throw new BadRequestException(
                'Нельзя забрать роль администратора у самого себя'
            );
        }

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: dto
        });

        return { user: this.createDto(updatedUser) };
    }

    async delete(id: number) {
        const existingUser = await this.getById(id);

        await this.prismaService.user.delete({ where: { id } });

        return { user: this.createDto(existingUser) };
    }
}
