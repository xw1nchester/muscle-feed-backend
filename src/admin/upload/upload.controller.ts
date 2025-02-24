import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { UploadedFile as UploadedFileDto } from '@upload/interfaces';

import { MapPipe } from './pipes/map.pipe';

@Controller('admin/upload')
export class UploadController {
    constructor(private readonly configService: ConfigService) {}

    @Role(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    @UseInterceptors(
        FilesInterceptor('file', 10, {
            storage: diskStorage({
                destination: 'uploads',
                filename: (req, file, cb) => {
                    const ext = extname(file.originalname);
                    cb(null, v4() + ext);
                }
            })
        })
    )
    @Post()
    async upload(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length == 0) {
            throw new BadRequestException(
                'Необходимо загрузить хотя бы один файл'
            );
        }

        const staticUrl = this.configService.get('STATIC_URL');

        return {
            files: files.map(({ filename, originalname, mimetype, size }) => ({
                url: `${staticUrl}/${filename}`,
                name: originalname,
                type: mimetype,
                size
            }))
        };
    }

    @UseInterceptors(FileInterceptor('file'))
    @Post('map')
    async uploadMap(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: 'image/*' })]
            }),
            MapPipe
        )
        file: UploadedFileDto
    ) {
        return { file };
    }
}
