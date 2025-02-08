import * as sharp from 'sharp';

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AspectRatioPipe
    implements
        PipeTransform<Express.Multer.File[], Promise<Express.Multer.File[]>>
{
    async transform(
        images: Express.Multer.File[]
    ): Promise<Express.Multer.File[]> {
        for (const image of images) {
            const metadata = await sharp(image.buffer).metadata();

            if (metadata.width !== metadata.height) {
                throw new BadRequestException(
                    'Соотношение сторон картинки должно быть 1 к 1'
                );
            }
        }

        return images;
    }
}
