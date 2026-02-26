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
          user: true,                  // like Laravel user()
          addresses: { include: { region: { include: { country: true } } } },
          applicant_phones: true,

        // education: { where: { hide: false }, include: { college: true, major: true, level: true, course: true } },
        // positions: { where: { hide: false }, include: { position: true, level: true, industry: true, employer: { include: { region: { include: { country: true } } } } }, orderBy: { start_date: 'desc' } },
        // languages: { where: { hide: false }, include: { language: true, read: true, write: true, speak: true, understand: true }, orderBy: { created_at: 'desc' } },
          
          applicant_cultures: { 
          include: {
          culture: true, 
          },
          orderBy: { created_at: 'desc' },
          },

          applicant_tools: {
          include: {
          tools: true,
          },
          orderBy: { created_at: 'desc' },
          },
          applicant_personalities: {

          include: {
          personality: true,
          },

          orderBy: { created_at: 'desc' },
          },
          applicant_software: {
          include: {
          software: true,
          },
          orderBy: { created_at: 'desc' },
          }, 
          applicant_knowledge: {
          include: {
           knowledge: true,
          },
          orderBy: { created_at: 'desc' },
         },  
          applicant_proficiencies: {
          include: {
            proficiency: true,
            organization: true,
            college: true,
          },
          orderBy: { created_at: 'desc' },
         },
         applicant_trainings: {
          where: { hide: false },
          orderBy: { created_at: 'desc' },
        },
          referees: true,
          applicant_career: true, 
        // subscriptions: { where: { verify: 1, end_date: { gte: new Date() }, plan: { cv_used: { lt: 'cv_limit' } } } },
      },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');
     
    const cultures = applicant.applicant_cultures.map(ac => ac.culture);
    const softwares = applicant.applicant_software.map(as => as.software);
    const tools = applicant.applicant_tools.map(at => at.tools);
    const knowledges = applicant.applicant_knowledge.map(ak => ak.knowledge);
    const personalities = applicant.applicant_personalities.map(ap => ap.personality);

     const proficiencies = applicant.applicant_proficiencies.map(ap => ({
      ...ap,
      proficiencyName: ap.proficiency?.proficiency_name,
      organizationName: ap.organization?.organization_name,
      collegeName: ap.college?.college_name,
    }));
    const trainings = applicant.applicant_trainings.map(at => ({
      ...at,
      started: at.started,
      ended: at.ended,
      name: at.name,
      institution: at.institution,
      description: at.description,
      attachment: at.attachment,
    }));

    const phones = applicant.applicant_phones.map(p => p.phone_number);


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
        email: applicant.user?.email,
        addresses: applicant.addresses,
        phones,
      // education: applicant.education,
      // positions: applicant.positions,
      // languages: applicant.languages,
        proficiencies,
        knowledges,
        personalities,
        tools,
        softwares,
        cultures,
        trainings,
        referees: applicant.referees,
        careers: applicant.applicant_career,
      // subscriptions: applicant.subscriptions,
    };

    return { data };
  }
}