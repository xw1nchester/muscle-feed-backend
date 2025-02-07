import { genSaltSync, hashSync } from 'bcrypt';

import { Injectable, NotFoundException } from '@nestjs/common';

import { Address, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { RegisterRequestDto } from '@auth/dto/register-request.dto';

import { AddressRequestDto } from './dto/address-request.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

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
        const { id, email, isVerified, roles, firstName, lastName, phone } =
            user;
        return { id, email, isVerified, roles, firstName, lastName, phone };
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

    async createDtoById(id: number) {
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

    createAddressDto(address: Address) {
        const { id, city, street, house, floor, apartment, isPrimary } =
            address;

        return { id, city, street, house, floor, apartment, isPrimary };
    }

    async getAddresses(userId: number) {
        const addresses = await this.prismaService.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });

        const primaryAddress = addresses.find(address => address.isPrimary);

        const otherAddresses = addresses.filter(address => !address.isPrimary);

        return {
            primaryAddress: primaryAddress
                ? this.createAddressDto(primaryAddress)
                : null,
            otherAddresses: otherAddresses.map(address =>
                this.createAddressDto(address)
            )
        };
    }

    async createAddress(userId: number, dto: AddressRequestDto) {
        const createdAddress = await this.prismaService.address.create({
            data: {
                ...dto,
                userId
            }
        });

        return { address: this.createAddressDto(createdAddress) };
    }

    async getUserAddress(id: number, userId: number) {
        const address = await this.prismaService.address.findFirst({
            where: {
                id,
                userId
            }
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

        const updatedAddress = await this.prismaService.address.update({
            where: {
                id: addressId
            },
            data: dto
        });

        return { address: this.createAddressDto(updatedAddress) };
    }

    async deleteAddress(addressId: number, userId: number) {
        const existingAddress = await this.getUserAddress(addressId, userId);

        if (!existingAddress) {
            throw new NotFoundException('Адрес не найден');
        }

        await this.prismaService.address.delete({ where: { id: addressId } });

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
            data: { isPrimary: !existingAddress.isPrimary }
        });

        return { address: this.createAddressDto(updatedAddress) };
    }
}
