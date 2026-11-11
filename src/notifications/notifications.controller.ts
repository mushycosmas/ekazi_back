import {
    Controller,
    Get,
    Req,
    Res,
    Query,
    UnauthorizedException,
    Patch,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

import { NotificationsService } from './notifications.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller()
export class NotificationsController {

    constructor(
        private readonly notifications: NotificationsService,
    ) { }


    @Get('applicant/notifications')
    @UseGuards(SanctumGuard)
    async index(
        @CurrentUser() user: Users,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.notifications.getNotifications(
            user.id,
            Number(page),
            Number(limit),
        );
    }

    @Patch('applicant/notifications/:id/read')
      @UseGuards(SanctumGuard)
    async markAsRead(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.notifications.markAsRead(
            id,
            user.id,
        );
    }

    @Patch('applicant/notifications/read-all')
    @UseGuards(SanctumGuard)
    async markAllAsRead(
        @CurrentUser() user: Users,
        ) 
        {
        return this.notifications.markAllAsRead(
            user.id,
        );
    }

    @Get('stream')
    @Public()
    async stream(
        @Req() req: Request,
        @Res() res: Response,
        @Query('reference') reference: string | undefined,
        @CurrentUser() user?: Users,
    ) {
        const isUser = !!user?.id;
        const isGuest = !isUser && !!reference?.trim();

        if (!isUser && !isGuest) {
            throw new UnauthorizedException(
                'Provide a token or a payment reference',
            );
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        res.write(
            `event: connected\n` +
            `data: ${JSON.stringify({
                mode: isUser ? 'user' : 'guest',
                userId: user?.id ?? null,
                reference: reference ?? null,
                ts: Date.now(),
            })}\n\n`,
        );

        const heartbeat = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 25000);

        const sub = isUser
            ? this.notifications
                .streamForUser(user!.id)
                .subscribe((evt) => this.writeEvent(res, evt))
            : this.notifications
                .streamForGuest(reference)
                .subscribe((evt) => this.writeEvent(res, evt));

        req.on('close', () => {
            clearInterval(heartbeat);
            sub.unsubscribe();
            res.end();
        });
    }

    private writeEvent(res: Response, evt: any) {
        res.write(
            `event: ${evt.event}\n` +
            `data: ${JSON.stringify(evt.data)}\n\n`,
        );
    }
}