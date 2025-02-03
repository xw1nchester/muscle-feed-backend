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

import { RoleGuard } from '@auth/guards/role.guard';
import { TeamService } from '@team/team.service';
import { Role } from '@auth/decorators';
import { TeamRequestDto } from './dto/team-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @Post()
    async create(@Body() dto: TeamRequestDto) {
        return await this.teamService.create(dto);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.teamService.createDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TeamRequestDto
    ) {
        return await this.teamService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.teamService.delete(id);
    }
}
