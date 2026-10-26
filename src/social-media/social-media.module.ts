 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SocialMedia } from 'src/entities/social-media.entity';
import { SocialMediaService } from './social-media.service';
import { SocialMediaController } from './social-media.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SocialMedia])],
    controllers: [SocialMediaController],
    providers: [SocialMediaService],
    exports: [SocialMediaService],
})
export class SocialMediaModule {}