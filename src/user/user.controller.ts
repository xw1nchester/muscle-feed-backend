import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch
} from '@nestjs/common';

import { ProfileRequestDto } from './dto/profile-request.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    async createDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.createDtoById(id);
    }

    @Patch(':id')
    async updateProfile(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ProfileRequestDto
    ) {
        return await this.userService.updateProfile(id, dto);
    }
}
