import { IsBoolean } from 'class-validator';

export class FeedbackRequestUpdateDto {
    @IsBoolean()
    isProcessed: boolean;
}
