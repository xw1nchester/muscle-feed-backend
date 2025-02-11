import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { UploadedFile } from './interfaces';
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
            SharpPipe
        )
        files: UploadedFile[]
    ) {
        return { files };
    }
}
