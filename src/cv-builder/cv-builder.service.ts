import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvBuilderService {
  constructor(private prisma: PrismaService) {}

  async getApplicantCv(applicantId: number) {
    const applicant = await this.prisma.applicants.findUnique({
      where: { id: applicantId },
      include: {
        marital: true,
        gender: true,
        user: true,
        addresses: { include: { region: { include: { country: true } } } },
        applicant_phones: true,

        applicant_education: {
          include: {
            college: true,
            course: true,
            major: true,
            education_level: true,
          },
          orderBy: { started: 'desc' },
        },

        // Current positions with all nested relations
        positions: {
          where: { end_date: null },
          include: {
            position: true,
            position_level: true,
            industry: true,
          
            start_salary: true,
            end_salary: true,
            current_salary: true,
          },
          orderBy: { start_date: 'desc' },
        },

        applicant_cultures: { include: { culture: true }, orderBy: { created_at: 'desc' } },
        applicant_tools: { include: { tools: true }, orderBy: { created_at: 'desc' } },
        applicant_personalities: { include: { personality: true }, orderBy: { created_at: 'desc' } },
        applicant_software: { include: { software: true }, orderBy: { created_at: 'desc' } },
        applicant_knowledge: { include: { knowledge: true }, orderBy: { created_at: 'desc' } },
        applicant_proficiencies: {
          include: { proficiency: true, organization: true, college: true },
          orderBy: { created_at: 'desc' },
        },
        applicant_trainings: { where: { hide: false }, orderBy: { created_at: 'desc' } },
        referees: true,
        applicant_career: true,
      },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');

    // Map positions
    const positions = applicant.positions.map(pos => ({
      ...pos,
      positionName: pos.position?.position_name,
      positionLevel: pos.position_level,
      industry: pos.industry,
      
      startSalary: pos.start_salary,
      endSalary: pos.end_salary,
      currentSalary: pos.current_salary,
    }));

    // Map other nested data
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

    const education = applicant.applicant_education.map(ed => ({
      ...ed,
      collegeName: ed.college?.college_name,
      courseName: ed.course?.course_name,
      majorName: ed.major?.name,
      levelName: ed.education_level?.education_level,
      started: ed.started,
      ended: ed.ended,
      attachment: ed.attachment,
    }));

    // Prepare final CV data
    const data = {
      id: applicant.id,
      fullName: `${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`.trim(),
      dob: applicant.dob,
      picture: applicant.picture,
      backgroundPicture: applicant.background_picture,
      maritalStatus: applicant.marital,
      gender: applicant.gender,
      email: applicant.user?.email,
      addresses: applicant.addresses,
      phones,
      education,
      positions,           // Include mapped positions here
      proficiencies,
      knowledges,
      personalities,
      tools,
      softwares,
      cultures,
      trainings,
      referees: applicant.referees,
      careers: applicant.applicant_career,
    };

    return { data };
  }
}