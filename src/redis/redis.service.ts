import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger
} from '@nestjs/common';

@Injectable()
export class RedisService {
    private logger = new Logger(RedisService.name);
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async set(key: string, value: unknown, ttl: number): Promise<void> {
        try {
            await this.cacheManager.set(
                key,
                JSON.stringify({ [key]: value }),
                ttl
            );
        } catch (error) {
            this.logger.error('failed to set value to chache', error.stack);
            throw new InternalServerErrorException();
        }
    }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            const jsonData: string | undefined =
                await this.cacheManager.get<string>(key);
            return jsonData ? JSON.parse(jsonData!) : undefined;
        } catch (error) {
            this.logger.error('failed to get value from cache', error.stack);
            throw new InternalServerErrorException();
        }
    }

    // TODO: delete
}
