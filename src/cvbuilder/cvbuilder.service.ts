// src/cvbuilder/cvbuilder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Injectable()
export class CvbuilderService {
  constructor(
    @InjectRepository(Applicants)
    private readonly applicantsRepo: Repository<Applicants>,
  ) {}

  async getApplicantCv(applicantId: number) {
    const applicant = await this.applicantsRepo.findOne({
      where: { id: applicantId },
      relations: [
        'user',
        'marital',
        'gender',
        'applicant_career',
        'applicant_tools',
        'applicant_tools.tools', // tools relation
        'applicant_phones',
        'referees',
        'applicant_cultures',
        'applicant_cultures.culture', // culture relation
        'applicant_knowledge',
        'applicant_knowledge.knowledge', // knowledge relation
      ],
    });

    if (!applicant) return null;

    return {
      id: applicant.id,
      first_name: applicant.first_name,
      middle_name: applicant.middle_name,
      last_name: applicant.last_name,
      dob: applicant.dob,
      status_profile: applicant.status_profile,
      nationality_id: applicant.nationality_id,
      picture: applicant.picture,
      background_picture: applicant.background_picture,
      marital: applicant.marital
        ? { marital_status: applicant.marital.marital_status }
        : null,
      gender: applicant.gender
        ? { gender_name: applicant.gender.gender_name }
        : null,
      user: applicant.user
        ? {
            id: applicant.user.id,
            role_id: applicant.user.role_id,
            username: applicant.user.username,
            email: applicant.user.email,
            verified: applicant.user.verified,
            temp_email: applicant.user.temp_email,
            last_activity_at: applicant.user.last_activity_at,
          }
        : null,
      applicant_career: applicant.applicant_career?.map((c) => ({
        career: c.career,
      })),
      applicant_tools: applicant.applicant_tools?.map((t) => ({
        tool_id: t.tool_id,
        tool_name: t.tools?.tool_name,
      })),
      applicant_phones: applicant.applicant_phones?.map((p) => ({
        phone_number: p.phone_number,
      })),
      referees: applicant.referees?.map((r) => ({
        first_name: r.first_name,
        middle_name: r.middle_name,
        last_name: r.last_name,
        employer: r.employer,
        referee_position: r.referee_position,
        email: r.email,
        phone: r.phone,
      })),
      applicant_cultures: applicant.applicant_cultures?.map((c) => ({
        culture_id: c.culture_id,
        culture_name: c.culture?.culture_name
      })),
      applicant_knowledge: applicant.applicant_knowledge?.map((k) => ({
        knowledge_id: k.knowledge_id,
        knowledge_name: k.knowledge?.knowledge_name,
      })),
    };
  }
}