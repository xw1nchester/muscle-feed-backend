import { join } from 'path';
import * as sharp from 'sharp';

import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UploadedFile } from '@upload/interfaces';

@Injectable()
export class MapPipe
    implements PipeTransform<Express.Multer.File, Promise<UploadedFile>>
{
    constructor(private readonly configService: ConfigService) {}

    async transform(file: Express.Multer.File) {
        const fileName = 'map.png';

        const { size } = await sharp(file.buffer)
            .toFormat('png')
            .toFile(
                join(__dirname, '..', '..', '..', '..', 'uploads', fileName)
            );

        return {
            url: `${this.configService.get('STATIC_URL')}/${fileName}`,
            name: fileName,
            type: 'image/png',
            size
        };
    }
}
