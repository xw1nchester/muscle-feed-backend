import { Module } from '@nestjs/common';

import { CityModule } from '@city/city.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [CityModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
