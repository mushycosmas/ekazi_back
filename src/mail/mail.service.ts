import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class MailService {
    private transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false, // false for STARTTLS on port 587
            auth: {
                user: this.configService.get<string>('MAIL_USERNAME'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false, // Only if your mail server requires it
            },
        });
    }

    // ✅ GENERIC MAIL METHOD (IMPORTANT)
    async sendMail(options: nodemailer.SendMailOptions) {
        return this.transporter.sendMail(options);
    }

    async sendPasswordReset(email: string, token: string) {
        const resetLink = `${this.configService.get(
            'FRONTEND_URL',
        )}/reset-password?token=${token}&email=${email}`;

        // 📄 Load HTML template (Option B)
        const templatePath = path.join(
            process.cwd(),
            'src',
            'mail',
            'templates',
            'password-reset.template.html',
        );

        let html = fs.readFileSync(templatePath, 'utf-8');

        // 🔁 Replace variables
        html = html.replace('{{RESET_LINK}}', resetLink);

        await this.transporter.sendMail({
            from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get(
                'MAIL_FROM_ADDRESS',
            )}>`,
            to: email,
            subject: 'Reset Password',
            html,
        });
    }

    async sendEmailVerification(email: string, token: string, username: string) {
        const verifyLink = `${this.configService.get(
            'FRONTEND_URL',
        )}/verify-email?token=${token}&email=${email}`;

        const templatePath = path.join(
            process.cwd(),
            'src',
            'mail',
            'templates',
            'email-verification.template.html',
        );

        let html = fs.readFileSync(templatePath, 'utf-8');

        html = html.replace('{{USERNAME}}', username);
        html = html.replace('{{VERIFY_LINK}}', verifyLink);

        await this.transporter.sendMail({
            from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get(
                'MAIL_FROM_ADDRESS',
            )}>`,
            to: email,
            subject: 'Verify Your Email',
            html,
        });
    }



}