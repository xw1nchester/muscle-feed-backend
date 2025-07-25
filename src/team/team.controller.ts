import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { TeamService } from './team.service';

@Public()
@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(0)
    @CacheKey('team')
    @Get()
    async findAll() {
        return await this.teamService.findAll();
    }
}
