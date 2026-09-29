import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
 
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Remark } from 'src/entities/remark.entity';
import { Users } from 'src/entities/users.entity';
 
import { RemarkController } from './remark.controller';
 
import { RemarkService } from './remark.service';

 @Module({
    imports: [
        TypeOrmModule.forFeature([
      
            Remark,
      
            Users,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        
        RemarkController,
    ],

    providers: [
      
        RemarkService,
    ],

    exports: [
     
        RemarkService,
    ],
})
export class RemarkModule {}
