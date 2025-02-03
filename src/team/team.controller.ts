import { Controller, Get } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { TeamService } from './team.service';

@Public()
@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @Get()
    async findAll() {
        return await this.teamService.findAll();
    }
}
