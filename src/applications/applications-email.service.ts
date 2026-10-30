import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ApplicationsEmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendApplicationEmail(params: {
    to: string;
    applicantName: string;
    applicantEmail: string;
    jobTitle: string;
    notes: string;
    cvPath?: string;
  }): Promise<void> {
    try {
      const attachments: nodemailer.SendMailOptions['attachments'] = [];

      if (params.cvPath) {
        // Only pass a server-controlled, validated file path.
        attachments.push({
          path: params.cvPath,
          filename: 'Applicant-CV.pdf',
        });
      }

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: params.to,
        replyTo: params.applicantEmail,
        subject: `Application for ${params.jobTitle}`,
        text: [
          `Applicant: ${params.applicantName}`,
          `Email: ${params.applicantEmail}`,
          `Position: ${params.jobTitle}`,
          '',
          'Cover letter:',
          params.notes,
        ].join('\n'),
        attachments,
      });
    } catch {
      throw new InternalServerErrorException(
        'Unable to send the job application email.',
      );
    }
  }
}