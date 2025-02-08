import { Global, Module } from '@nestjs/common';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Global()
@Module({
    providers: [UploadService],
    exports: [UploadService],
    controllers: [UploadController]
})
export class UploadModule {}
