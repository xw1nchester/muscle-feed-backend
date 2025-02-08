import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';

import { UploadedFile } from './interfaces';
import { AspectRatioPipe } from './pipes/aspect-ration.pipe';
import { SharpPipe } from './pipes/sharp.pipe';

@Controller('upload')
export class UploadController {
    @UseInterceptors(FilesInterceptor('file'))
    @Post()
    async upload(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: 'image/*' }),
                    new MaxFileSizeValidator({
                        maxSize: 2000000,
                        message: 'Картинка не должна превышать 2 мб'
                    })
                ]
            }),
            AspectRatioPipe,
            SharpPipe
        )
        files: UploadedFile[]
    ) {
        return { files };
    }
}
