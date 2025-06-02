import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { AdminOrderRequestDto } from '../dto/admin-order-request.dto';

@Injectable()
export class ValidateFreezeDates implements PipeTransform {
    transform(dto: AdminOrderRequestDto) {
        const incorrectData = dto.freezes.find(
            data => data.startDate.getTime() > data.endDate.getTime()
        );

        if (incorrectData) {
            throw new BadRequestException(
                'Дата начала заморозки не должна быть больше чем дата окончания заморозки'
            );
        }

        return dto;
    }
}
