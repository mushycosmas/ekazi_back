 import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';

import { BookmarksService } from './bookmarks.service';
import { BookmarkDto } from './dto/bookmark.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant/')
@UseGuards(SanctumGuard)
export class BookmarksController {
  constructor(
    private readonly bookmarksService: BookmarksService,
  ) {}

  // POST /api/bookmarks
  @Post('bookmarks')
  store(
    @CurrentUser() user: Users,
    @Body() dto: BookmarkDto,
  ) {
    return this.bookmarksService.store(user.id, dto);
  }

  // DELETE /api/bookmarks
  @Delete('bookmarks')
  destroy(
    @CurrentUser() user: Users,
    @Body() dto: BookmarkDto,
  ) {
    return this.bookmarksService.destroy(user.id, dto);
  }

  // GET /api/bookmarks
  @Get('bookmarks')
  index(@CurrentUser() user: Users) {
    return this.bookmarksService.index(user.id);
  }

  // POST /api/bookmarks/check
  @Post('/bookmarks/check')
  check(
    @CurrentUser() user: Users,
    @Body() dto: BookmarkDto,
  ) {
    return this.bookmarksService.check(user.id, dto);
  }
}