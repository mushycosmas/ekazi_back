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
        'applicant_tools.tools', // include tools relation
        'applicant_phones',
        // add more relations if needed (referees, trainings, addresses, etc.)
      ],
    });

    if (!applicant) return null;

    // Clean data output
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
        tool_name: t.tools?.tool_name, // get tool name from relation
      })),
      applicant_phones: applicant.applicant_phones?.map((p) => ({
        phone_number: p.phone_number,
      })),
    };
  }
}