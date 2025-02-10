import { Injectable, NotFoundException } from '@nestjs/common';

import { Team } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { TeamRequestDto } from '@admin/team/dto/team-request.dto';
import { UploadService } from '@upload/upload.service';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class TeamService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly fileService: UploadService
    ) {}

    createDto(team: Team) {
        const { id, picture, createdAt, updatedAt, ...rest } = team;

        const localizedFields = extractLocalizedFields(rest);

        return {
            id,
            picture,
            ...localizedFields,
            createdAt,
            updatedAt
        };
    }

    async create(dto: TeamRequestDto) {
        const createdTeam = await this.prismaService.team.create({
            data: dto
        });

        return { employee: this.createDto(createdTeam) };
    }

    async getById(id: number) {
        const team = await this.prismaService.team.findFirst({
            where: { id }
        });

        if (!team) {
            throw new NotFoundException('Сотрудник не найден');
        }

        return team;
    }

    async getDtoById(id: number) {
        const existingTeam = await this.getById(id);

        return { employee: this.createDto(existingTeam) };
    }

    async update(id: number, dto: TeamRequestDto) {
        const existingTeam = await this.getById(id);

        const updatedTeam = await this.prismaService.team.update({
            where: { id },
            data: dto
        });

        if (existingTeam.picture != dto.picture) {
            this.fileService.delete(existingTeam.picture);
        }

        return { employee: this.createDto(updatedTeam) };
    }

    async delete(id: number) {
        const existingTeam = await this.getById(id);

        await this.prismaService.team.delete({ where: { id } });

        this.fileService.delete(existingTeam.picture);

        return { employee: this.createDto(existingTeam) };
    }

    async findAll() {
        const teamData = await this.prismaService.team.findMany();

        const team = teamData.map(team => this.createDto(team));

        return { team };
    }
}
