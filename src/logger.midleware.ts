import { NextFunction, Request, Response } from 'express';

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const startDate = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;

            this.logger.log(
                `${method} ${originalUrl} ${statusCode} ${Date.now() - startDate}ms`
            );
        });

        next();
    }
}
