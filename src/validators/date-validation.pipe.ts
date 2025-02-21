import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DateValidationPipe implements PipeTransform {
    transform(value: any) {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
            throw new BadRequestException('Дата в неправильном формате');
        }

        return date;
    }
}
