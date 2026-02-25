import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvBuilderService {
  constructor(private prisma: PrismaService) {}

  async getApplicantCv(applicantId: number) {
    const applicant = await this.prisma.applicants.findUnique({
      where: { id: applicantId },
      include: {
        // Uncomment when you add these tables/relations in Prisma schema
         marital: true,               
         gender: true,                // like Laravel gender()
        // user: true,                  // like Laravel user()
        // addresses: { include: { region: { include: { country: true } } } },
        // phones: true,
        // education: { where: { hide: false }, include: { college: true, major: true, level: true, course: true } },
        // positions: { where: { hide: false }, include: { position: true, level: true, industry: true, employer: { include: { region: { include: { country: true } } } } }, orderBy: { start_date: 'desc' } },
        // languages: { where: { hide: false }, include: { language: true, read: true, write: true, speak: true, understand: true }, orderBy: { created_at: 'desc' } },
        // proficiencies: { where: { hide: false }, include: { proficiency: true, organization: true }, orderBy: { created_at: 'desc' } },
        // knowledge: { where: { hide: false }, include: { knowledge: true }, orderBy: { created_at: 'desc' } },
        // personalities: { where: { hide: false }, include: { personality: true }, orderBy: { created_at: 'desc' } },
        // tools: { where: { hide: false }, include: { tool: true }, orderBy: { created_at: 'desc' } },
        // software: { where: { hide: false }, include: { software: true }, orderBy: { created_at: 'desc' } },
        // cultures: { where: { hide: false }, include: { culture: true }, orderBy: { created_at: 'desc' } },
        // referees: { where: { hide: false } },
        // training: { where: { hide: false } },
        // careers: true,
        // subscriptions: { where: { verify: 1, end_date: { gte: new Date() }, plan: { cv_used: { lt: 'cv_limit' } } } },
      },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');

    // Prepare minimal CV data
    const data = {
      id: applicant.id,
      fullName: `${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`.trim(),
      dob: applicant.dob,
      picture: applicant.picture,
      backgroundPicture: applicant.background_picture,
      // Uncomment these if included above
       maritalStatus: applicant.marital,
       gender: applicant.gender,
      // email: applicant.user?.email,
      // addresses: applicant.addresses,
      // phones: applicant.phones,
      // education: applicant.education,
      // positions: applicant.positions,
      // languages: applicant.languages,
      // proficiencies: applicant.proficiencies,
      // knowledge: applicant.knowledge,
      // personalities: applicant.personalities,
      // tools: applicant.tools,
      // software: applicant.software,
      // cultures: applicant.cultures,
      // referees: applicant.referees,
      // training: applicant.training,
      // careers: applicant.careers,
      // subscriptions: applicant.subscriptions,
    };

    return { data };
  }
}