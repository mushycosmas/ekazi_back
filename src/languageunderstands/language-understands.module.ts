 import {
 Module,
} from '@nestjs/common';
import {TypeOrmModule,} from '@nestjs/typeorm';

import { LanguageUnderstands } from 'src/entities/language-understands.entity';
import {LanguageUnderstandsService,} from './language-understands.service';
import {LanguageUnderstandsController,} from './language-understands.controller';

@Module({

imports:[
 TypeOrmModule.forFeature([
   LanguageUnderstands,
 ]),
],


controllers:[
 LanguageUnderstandsController,
],

providers:[
 LanguageUnderstandsService,
],


exports:[
 LanguageUnderstandsService,
],


})
export class LanguageUnderstandsModule {}