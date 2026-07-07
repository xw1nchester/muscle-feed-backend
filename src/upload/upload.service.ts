import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    delete(url: string) {
        const filePath = join(__dirname, '..', '..', 'uploads', basename(url));

        if (existsSync(filePath)) {
            unlinkSync(filePath);
            this.logger.debug(`File deleted successfully: ${filePath}`);
        }
    }
}
