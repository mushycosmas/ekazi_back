import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CorrespondenceService } from './correspondence.service';

import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { MarkReadDto } from './dto/mark-read.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('correspondence')
@UseGuards(SanctumGuard)
export class CorrespondenceController {
  constructor(
    private readonly correspondenceService: CorrespondenceService,
  ) {}

  // =========================================================
  // CREATE THREAD
  // =========================================================

 
@Post('threads')
async createThread(
  @CurrentUser() user: Users,
  @Body() dto: CreateThreadDto,
) {
  const senderType = this.getSenderType(user);

  return this.correspondenceService.createThread(
    user.id,
    senderType,
    dto,
  );
}

  // =========================================================
  // GET MY THREADS
  // =========================================================

  @Get('threads')
  async getMyThreads(
    @CurrentUser() user: Users,
  ) {
    const userId = user.id;

    return this.correspondenceService.getUserThreads(
      userId,
    );
  }

  // =========================================================
  // GET THREAD
  // =========================================================

  @Get('threads/:threadId')
  async getThread(
    @CurrentUser() user: Users,
    @Param('threadId', ParseIntPipe)
    threadId: number,
  ) {
    const userId = user.id;

    return this.correspondenceService.getThread(
      threadId,
      userId,
    );
  }

  // =========================================================
  // GET THREAD MESSAGES
  // =========================================================

  @Get('threads/:threadId/messages')
  async getMessages(
    @CurrentUser() user: Users,

    @Param('threadId', ParseIntPipe)
    threadId: number,

    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    const userId = user.id;

    return this.correspondenceService.getMessages(
      threadId,
      userId,
      Number(page),
      Number(limit),
    );
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  @Post('messages')
  async sendMessage(
    @CurrentUser() user: Users,
    @Body() dto: SendMessageDto,
  ) {
    const userId = user.id;

    const senderType =
      this.getSenderType(user);

    return this.correspondenceService.sendMessage(
      userId,
      senderType,
      dto,
    );
  }

  // =========================================================
  // ADD PARTICIPANT
  // =========================================================

  @Post('threads/:threadId/participants')
  async addParticipant(
    @CurrentUser() user: Users,

    @Param('threadId', ParseIntPipe)
    threadId: number,

    @Body() dto: AddParticipantDto,
  ) {
    const userId = user.id;

    return this.correspondenceService.addParticipant(
      threadId,
      userId,
      dto,
    );
  }

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

  @Delete(
    'threads/:threadId/participants/:participantUserId',
  )
  async removeParticipant(
    @CurrentUser() user: Users,

    @Param('threadId', ParseIntPipe)
    threadId: number,

    @Param(
      'participantUserId',
      ParseIntPipe,
    )
    participantUserId: number,
  ) {
    const userId = user.id;

    return this.correspondenceService.removeParticipant(
      threadId,
      userId,
      participantUserId,
    );
  }

  // =========================================================
  // MARK READ
  // =========================================================

  @Patch('threads/:threadId/read')
  async markAsRead(
    @CurrentUser() user: Users,

    @Param('threadId', ParseIntPipe)
    threadId: number,

    @Body() dto: MarkReadDto,
  ) {
    const userId = user.id;

    return this.correspondenceService.markAsRead(
      threadId,
      userId,
      dto.message_id,
    );
  }

  // =========================================================
  // CLOSE THREAD
  // =========================================================

  @Patch('threads/:threadId/close')
  async closeThread(
    @CurrentUser() user: Users,

    @Param('threadId', ParseIntPipe)
    threadId: number,
  ) {
    const userId = user.id;

    return this.correspondenceService.closeThread(
      threadId,
      userId,
    );
  }

  // =========================================================
  // GET SENDER TYPE
  // =========================================================

  private getSenderType(
    user: Users,
  ):
    | 'admin'
    | 'employer'
    | 'applicant'
    | 'system' {
    const senderType =
      (user as any).sender_type ??
      (user as any).type ??
      (user as any).role_type;

    if (
      senderType === 'admin' ||
      senderType === 'employer' ||
      senderType === 'applicant' ||
      senderType === 'system'
    ) {
      return senderType;
    }

    return 'applicant';
  }
}