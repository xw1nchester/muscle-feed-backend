import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RedisService {
    private logger = new Logger(RedisService.name);
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async set(key: string, value: string, ttl: number) {
        try {
            await this.cacheManager.set(key, value, ttl);
        } catch (error) {
            this.logger.error('failed to set value to chache', error.stack);
        }
    }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            const jsonData: string | undefined =
                await this.cacheManager.get<string>(key);
            return jsonData ? JSON.parse(jsonData!) : undefined;
        } catch (error) {
            this.logger.error('failed to get value from cache', error.stack);
        }
    }

    async del(key: string) {
        try {
            await this.cacheManager.del(key);
        } catch (error) {
            this.logger.error('failed to delete key from cache', error.stack);
        }
    }

    // TODO: подумать как можно не очищать весь кеш, а удалять ключи по паттерну
    // сейчас это используется при изменении информации о меню, чтобы удалить все ключи personal:date
    async clear() {
        try {
            await this.cacheManager.clear();
        } catch (error) {
            this.logger.error('failed to clear all cache', error.stack);
        }
    }
}
