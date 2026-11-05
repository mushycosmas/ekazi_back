 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionCategories } from 'src/entities/position-categories.entity';
import { PositionCategoriesController } from './position-categories.controller';
import { PositionCategoriesService } from './position-categories.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PositionCategories,
            Users,
            PersonalAccessToken,
        ]),
    ],
    controllers: [PositionCategoriesController],
    providers: [PositionCategoriesService],
    exports: [PositionCategoriesService],
})
export class PositionCategoriesModule {}