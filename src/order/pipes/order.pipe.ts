import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { OrderRequestDto } from '@order/dto/order-request.dto';

@Injectable()
export class OrderPipe implements PipeTransform {
    transform(dto: OrderRequestDto) {
        dto.skippedWeekdays = [...new Set(dto.skippedWeekdays)];

        if (dto.skippedWeekdays.length === 7) {
            throw new BadRequestException('Нельзя пропускать все дни недели');
        }

        return dto;
    }
}
