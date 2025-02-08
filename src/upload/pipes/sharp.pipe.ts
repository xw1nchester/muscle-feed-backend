import { join } from 'path';
import * as sharp from 'sharp';
import { v4 } from 'uuid';

import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UploadedFile } from '@upload/interfaces';

@Injectable()
export class SharpPipe
    implements PipeTransform<Express.Multer.File[], Promise<UploadedFile[]>>
{
    constructor(private readonly configService: ConfigService) {}

    async transform(images: Express.Multer.File[]) {
        const files: UploadedFile[] = [];

        const staticUrl = this.configService.get('STATIC_URL');

        for (const image of images) {
            const fileName = v4() + '.jpeg';

            const { size } = await sharp(image.buffer)
                .resize(1024)
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(join(__dirname, '..', '..', '..', 'uploads', fileName));

            files.push({
                url: `${staticUrl}/${fileName}`,
                name: fileName,
                type: 'image/jpeg',
                size
            });
        }

        return files;
    }
}
