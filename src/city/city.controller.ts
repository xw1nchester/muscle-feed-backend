import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { CityService } from './city.service';

@Public()
@Controller('city')
export class CityController {
    constructor(private readonly cityService: CityService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(0)
    @CacheKey('cities')
    @Get()
    async find() {
        return await this.cityService.find();
    }
}
