import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient<
        Prisma.PrismaClientOptions,
        'query' | 'info' | 'warn' | 'error'
    >
    implements OnModuleInit
{
    constructor(private readonly configService: ConfigService) {
        super({
            log:
                configService.get('PRISMA_QUERY_LOG') == 'true'
                    ? [{ emit: 'event', level: 'query' }]
                    : []
        });
    }

    async onModuleInit() {
        this.$on('query', (event: Prisma.QueryEvent) => {
            // if (
            //     !event.query.includes(
            //         `"public"."order_day_dishes"."order_day_id"`
            //     )
            // ) {
            //     return;
            // }

            console.log();
            console.log('Query: ' + event.query);
            console.log('Params: ' + event.params);
            console.log();
        });

        await this.$connect();
    }
}
