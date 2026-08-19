import { Module } from '@nestjs/common';

import { BeforeAfterModule } from '@before-after/before-after.module';
import { CityModule } from '@city/city.module';
import { DishModule } from '@dish/dish.module';
import { FaqModule } from '@faq/faq.module';
import { FeedbackModule } from '@feedback/feedback.module';
import { MenuModule } from '@menu/menu.module';
import { OrderModule } from '@order/order.module';
import { PromocodeModule } from '@promocode/promocode.module';
import { PromotionModule } from '@promotion/promotion.module';
import { ReviewModule } from '@review/review.module';
import { SettingsModule } from '@settings/settings.module';
import { TeamModule } from '@team/team.module';
import { UploadModule } from '@upload/upload.module';
import { UserModule } from '@user/user.module';

import { BeforeAfterController } from './before-after/before-after.controller';
import { CityController } from './city/city.controller';
import { DishController } from './dish/dish.controller';
import { FaqController } from './faq/faq.controller';
import { FeedbackController } from './feedback/feedback.controller';
import { MenuController } from './menu/menu.controller';
import { OrderController } from './order/order.controller';
import { PromocodeController } from './promocode/promocode.controller';
import { PromotionController } from './promotion/promotion.controller';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { ReviewController } from './review/review.controller';
import { SettingsController } from './settings/settings.controller';
import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';
import { UserController } from './user/user.controller';

@Module({
    imports: [
        TeamModule,
        DishModule,
        ReviewModule,
        MenuModule,
        FaqModule,
        CityModule,
        OrderModule,
        UserModule,
        PromocodeModule,
        SettingsModule,
        UploadModule,
        BeforeAfterModule,
        PromotionModule,
        FeedbackModule
    ],
    controllers: [
        TeamController,
        UploadController,
        DishController,
        ReviewController,
        MenuController,
        FaqController,
        CityController,
        OrderController,
        UserController,
        ReportController,
        PromocodeController,
        SettingsController,
        BeforeAfterController,
        PromotionController,
        FeedbackController
    ],
    providers: [ReportService]
})
export class AdminModule {}
