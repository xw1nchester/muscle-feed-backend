import { Injectable, PipeTransform } from '@nestjs/common';

import { DishRequestDto } from '../dto/dish-request.dto';

@Injectable()
export class DishPipe implements PipeTransform {
    transform(dto: DishRequestDto) {
        dto.dishTypeId = Number(dto.dishTypeId);
        dto.calories = Number(dto.calories);
        dto.weight = Number(dto.weight);
        dto.proteins = Number(dto.proteins);
        dto.fats = Number(dto.fats);
        dto.carbohydrates = Number(dto.carbohydrates);

        return dto;
    }
}
