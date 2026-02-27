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
    const applicant = await this.applicantsRepo
      .createQueryBuilder('applicant')
      .leftJoinAndSelect('applicant.user', 'user')
      .leftJoinAndSelect('applicant.marital', 'marital')
      .leftJoinAndSelect('applicant.gender', 'gender')
      .leftJoinAndSelect('applicant.applicant_career', 'career')
      .leftJoinAndSelect('applicant.applicant_tools', 'applicantTools')
      .leftJoinAndSelect('applicantTools.tools', 'tools')
      .leftJoinAndSelect('applicant.applicant_phones', 'phones')
      .leftJoinAndSelect('applicant.referees', 'referees')
      .leftJoinAndSelect('applicant.applicant_cultures', 'applicantCultures')
      .leftJoinAndSelect('applicantCultures.culture', 'culture')
      .leftJoinAndSelect('applicant.applicant_knowledge', 'applicantKnowledge')
      .leftJoinAndSelect('applicantKnowledge.knowledge', 'knowledge')
      // Pick only the columns you want
      .select([
        'applicant.id',
        'applicant.first_name',
        'applicant.middle_name',
        'applicant.last_name',
        'applicant.dob',
        'applicant.nationality_id',
        'applicant.picture',
        'applicant.background_picture',

        'user.email',
        'marital.id',
        'marital.marital_status',

        'gender.id',
        'gender.gender_name',

        'career.career',

        'tools.id',
        'tools.tool_name',
        'applicantTools.tool_id',

        'phones.phone_number',

        'referees.first_name',
        'referees.middle_name',
        'referees.last_name',
        'referees.employer',
        'referees.referee_position',
        'referees.email',
        'referees.phone',

        'culture.id',
        'culture.culture_name',

        'knowledge.id',
        'knowledge.knowledge_name',
      ])
      .where('applicant.id = :id', { id: applicantId })
      .getOne();

    if (!applicant) return null;

    return applicant;
  }
}