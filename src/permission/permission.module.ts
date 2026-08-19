import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
     imports: [

        TypeOrmModule.forFeature([
            Permission,
            Users,
            PersonalAccessToken,
        ]),
        

    ],

    controllers: [

        PermissionController,

    ],

    providers: [

        PermissionService,

    ],

    exports: [

        PermissionService,

    ],
})
export class PermissionModule {}
