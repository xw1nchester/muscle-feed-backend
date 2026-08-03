import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post
} from '@nestjs/common';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { AddressRequestDto } from './dto/address-request.dto';
import { AvatarRequestDto } from './dto/avatar-request.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getDtoById(@CurrentUser() user: JwtPayload) {
        return await this.userService.getDtoById(user.id);
    }

    @Patch()
    async updateProfile(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ProfileRequestDto
    ) {
        return await this.userService.updateProfile(user.id, dto);
    }

    @Get('address')
    async getAddresses(@CurrentUser() user: JwtPayload) {
        return await this.userService.getAddresses(user.id);
    }

    @Post('address')
    async createAddress(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AddressRequestDto
    ) {
        return await this.userService.createAddress(user.id, dto);
    }

    @Patch('address/:id')
    async updateAddress(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: AddressRequestDto
    ) {
        return await this.userService.updateAddress(id, user.id, dto);
    }

    @Get('address/:id')
    async getUserAddressDto(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.userService.getUserAddressDto(id, user.id);
    }

    @Delete('address/:id')
    async deleteAddress(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.userService.deleteAddress(id, user.id);
    }

    @Patch('address/:id/toggle-primary')
    async togglePrimaryAddress(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.userService.togglePrimaryAddress(id, user.id);
    }

    @Patch('avatar')
    async updateAvatar(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AvatarRequestDto
    ) {
        return await this.userService.updateAvatar(user.id, dto.avatar);
    }

    @Delete('avatar')
    async deleteAvatar(@CurrentUser() user: JwtPayload) {
        return await this.userService.deleteAvatar(user.id);
    }

    // напришивается LoyaltyModule
    @Get('loyalty')
    async getUserLoyalty(@CurrentUser() user: JwtPayload) {
        return await this.userService.getUserLoyalty(user.id);
    }
}
