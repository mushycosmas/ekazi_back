import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import {
    Request,
} from 'express';

import {
    PaymentService,
} from './payment.service';

import {
    createHmac,
    timingSafeEqual,
} from 'crypto';

import {
    ConfigService,
} from '@nestjs/config';

import {
    InitiatePaymentDto,
} from './dto/initiate-payment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Public } from 'src/auth/decorators/public.decorator'; // Import this

@Controller('payment')
export class PaymentController {

    constructor(
        private readonly paymentService: PaymentService,
        private readonly configService: ConfigService,
    ) {}

    // ============================================================
    // INITIATE PAYMENT (Protected)
    // ============================================================

    @Post('initiate')
    @UseGuards(SanctumGuard)
    @HttpCode(200)
    async initiatePayment(
        @Body() dto: InitiatePaymentDto,
        @CurrentUser() user: Users,
    ) {
        if (!user) {
            return {
                success: false,
                message: 'Authenticated user not found',
            };
        }

        return this.paymentService.initiatePayment(dto, user);
    }

    // ============================================================
    // SELCOM CALLBACK (Public)
    // ============================================================

    @Post('callback/selcom')
    @Public() // Now this will work
    @HttpCode(200)
    async selcomCallback(
        @Body() payload: any,
    ) {
        return this.paymentService.handleSelcomCallback(payload);
    }

    // ============================================================
    // SNIPPE WEBHOOK (Public - NO AUTH)
    // ============================================================

    @Post('webhook/snippe')
    @Public() 
    @HttpCode(200)
    async snippeWebhook(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers('x-webhook-timestamp') timestamp: string,
        @Headers('x-webhook-signature') signature: string,
    ) {
        try {
            // ========================================================
            // RAW BODY
            // ========================================================
            const rawBody = req.rawBody;

            if (!rawBody) {
                return {
                    success: false,
                    message: 'Raw webhook body is missing',
                };
            }

            // ========================================================
            // WEBHOOK SECRET
            // ========================================================
            const secret = this.configService.get<string>('SNIPPE_WEBHOOK_SECRET');

            if (!secret) {
                console.warn('SNIPPE_WEBHOOK_SECRET is not configured');
                return {
                    success: false,
                    message: 'SNIPPE_WEBHOOK_SECRET is not configured',
                };
            }

            // ========================================================
            // SIGNATURE HEADERS
            // ========================================================
            if (!timestamp || !signature) {
                return {
                    success: false,
                    message: 'Webhook signature headers are required',
                };
            }

            // ========================================================
            // TIMESTAMP VALIDATION
            // ========================================================
            const eventTime = Number(timestamp);

            if (!Number.isFinite(eventTime)) {
                return {
                    success: false,
                    message: 'Invalid webhook timestamp',
                };
            }

            const currentTime = Math.floor(Date.now() / 1000);

            if (Math.abs(currentTime - eventTime) > 300) {
                return {
                    success: false,
                    message: 'Webhook timestamp is too old',
                };
            }

            // ========================================================
            // CREATE HMAC MESSAGE
            // ========================================================
            const message = `${timestamp}.${rawBody.toString('utf8')}`;

            // ========================================================
            // EXPECTED SIGNATURE
            // ========================================================
            const expectedSignature = createHmac('sha256', secret)
                .update(message)
                .digest('hex');

            // ========================================================
            // SAFE COMPARISON
            // ========================================================
            const signatureBuffer = Buffer.from(signature, 'utf8');
            const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

            if (
                signatureBuffer.length !== expectedBuffer.length ||
                !timingSafeEqual(signatureBuffer, expectedBuffer)
            ) {
                return {
                    success: false,
                    message: 'Invalid webhook signature',
                };
            }

            // ========================================================
            // PARSE WEBHOOK JSON
            // ========================================================
            let event: any;

            try {
                event = JSON.parse(rawBody.toString('utf8'));
            } catch {
                return {
                    success: false,
                    message: 'Invalid webhook JSON',
                };
            }

            // ========================================================
            // PROCESS SNIPPE WEBHOOK
            // ========================================================
            return this.paymentService.handleSnippeWebhook(event);

        } catch (error) {
            console.error('Webhook processing error:', error);
            // Always return 200 for webhooks
            return {
                success: false,
                message: error.message || 'Webhook processing failed',
            };
        }
    }

    // ============================================================
    // TEST WEBHOOK ENDPOINT (Public)
    // ============================================================
    @Get('webhook/snippe/test')
    @Public()
    async testWebhook() {
        return {
            message: 'Snippe webhook endpoint is configured correctly',
            method: 'POST',
            endpoint: '/api/payment/webhook/snippe',
            status: 'active',
            timestamp: new Date().toISOString(),
            signature_validation: !!this.configService.get<string>('SNIPPE_WEBHOOK_SECRET'),
        };
    }

    // ============================================================
    // CONFIG TEST (Public)
    // ============================================================
    @Get('config-test')
    @Public()
    async configTest() {
        return {
            snippeConfigured: !!this.configService.get<string>('SNIPPE_API_KEY'),
            provider: this.configService.get<string>('PAYMENT_PROVIDER'),
            webhookSecretConfigured: !!this.configService.get<string>('SNIPPE_WEBHOOK_SECRET'),
            environment: process.env.NODE_ENV || 'development',
        };
    }
}