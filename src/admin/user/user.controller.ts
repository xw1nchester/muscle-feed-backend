import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { UserService } from '@user/user.service';

import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(RoleGuard)
    @Role(RoleEnum.MODERATOR)
    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return await this.userService.find(page, limit);
    }

    @UseGuards(RoleGuard)
    @Role(RoleEnum.MODERATOR)
    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.getDtoById(id);
    }

    @UseGuards(RoleGuard)
    @Role(RoleEnum.ADMIN)
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto
    ) {
        return await this.userService.update(id, dto);
    }
}
