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
          include: { college: true, course: true, major: true, education_level: true },
          orderBy: { started: 'desc' },
        },

        positions: {
          where: { end_date: null },
          include: {
            position: true,
            position_level: true,
            industry: true,
            applicant_employer: true,
            region: { include: { country: true } },
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

        // Applicant languages
        applicant_languages: {
          include: {
            language: true,
            read: true,
            write: true,
            speak: true,
            understand: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');

    const positions = (applicant.positions || []).map(pos => ({
      ...pos,
      positionName: pos.position?.position_name || null,
      positionLevel: pos.position_level || null,
      industry: pos.industry || null,
      employer: pos.applicant_employer || null,
      region: pos.region || null,
      startSalary: pos.start_salary || null,
      endSalary: pos.end_salary || null,
      currentSalary: pos.current_salary || null,
    }));

    const cultures = (applicant.applicant_cultures || [])
      .map(ac => ac.culture)
      .filter(c => c != null);

    const softwares = (applicant.applicant_software || [])
      .map(as => as.software)
      .filter(s => s != null);

    const tools = (applicant.applicant_tools || [])
      .map(at => at.tools)
      .filter(t => t != null);

    const knowledges = (applicant.applicant_knowledge || [])
      .map(ak => ak.knowledge)
      .filter(k => k != null);

    const personalities = (applicant.applicant_personalities || [])
      .map(ap => ap.personality)
      .filter(p => p != null);

    const proficiencies = (applicant.applicant_proficiencies || []).map(ap => ({
      ...ap,
      proficiencyName: ap.proficiency?.proficiency_name || null,
      organizationName: ap.organization?.organization_name || null,
      collegeName: ap.college?.college_name || null,
    }));

    const trainings = (applicant.applicant_trainings || []).map(at => ({
      ...at,
      started: at.started || null,
      ended: at.ended || null,
      name: at.name || null,
      institution: at.institution || null,
      description: at.description || null,
      attachment: at.attachment || null,
    }));

    const phones = (applicant.applicant_phones || []).map(p => p.phone_number || null);

    const education = (applicant.applicant_education || []).map(ed => ({
      ...ed,
      collegeName: ed.college?.college_name || null,
      courseName: ed.course?.course_name || null,
      majorName: ed.major?.name || null,
      levelName: ed.education_level?.education_level || null,
      started: ed.started || null,
      ended: ed.ended || null,
      attachment: ed.attachment || null,
    }));

    const languages = (applicant.applicant_languages || []).map(al => ({
      languageName: al.language?.language_name || null,
      readAbility: al.read?.read_ability || null,
      writeAbility: al.write?.write_ability || null,
      speakAbility: al.speak?.speak_ability || null,
      understandAbility: al.understand?.understand_ability || null,
    }));

    const data = {
      id: applicant.id,
      fullName: `${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`.trim(),
      dob: applicant.dob || null,
      picture: applicant.picture || null,
      backgroundPicture: applicant.background_picture || null,
      maritalStatus: applicant.marital || null,
      gender: applicant.gender || null,
      email: applicant.user?.email || null,
      addresses: applicant.addresses || [],
      phones,
      education,
      positions,
      languages,
      proficiencies,
      knowledges,
      personalities,
      tools,
      softwares,
      cultures,
      trainings,
      referees: applicant.referees || [],
      careers: applicant.applicant_career || [],
    };

    return { data };
  }
}