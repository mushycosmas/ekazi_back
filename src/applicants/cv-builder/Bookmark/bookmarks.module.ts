 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bookmark } from 'src/entities/bookmark.entity';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        Bookmark,
        Applicants,
        Users,
        PersonalAccessToken,
        
    ]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}