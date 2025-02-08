import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    delete(url: string) {
        const filePath = join(__dirname, '..', '..', 'uploads', basename(url));

        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
    }
}
