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
      // -------------------------------
      // Main applicant info
      // -------------------------------
      .select([
        'applicant.id',
        'applicant.first_name',
        'applicant.middle_name',
        'applicant.last_name',
        'applicant.dob',
        'applicant.email',
        'applicant.nationality',
      ])
      // -------------------------------
      // Relations
      // -------------------------------
      .leftJoinAndSelect('applicant.user', 'user')
      .leftJoinAndSelect('applicant.marital', 'marital')
      .leftJoinAndSelect('applicant.gender', 'gender')
      .leftJoinAndSelect('applicant.applicant_career', 'career')
      .leftJoinAndSelect('applicant.applicant_trainings', 'training')
      .leftJoinAndSelect('applicant.referees', 'referee')
      .leftJoinAndSelect('applicant.applicant_tools', 'tool')
      .leftJoinAndSelect('applicant.applicant_phones', 'phone')
      .leftJoinAndSelect('applicant.addresses', 'address')
      .leftJoinAndSelect('applicant.applicant_languages', 'language')
      .leftJoinAndSelect('applicant.applicant_knowledge', 'knowledge')
      .leftJoinAndSelect('applicant.applicant_proficiencies', 'proficiency')
      .leftJoinAndSelect('applicant.applicant_personalities', 'personality')
      // -------------------------------
      // Select only needed columns for each relation
      // -------------------------------
      .addSelect([
        'referee.id',
        'referee.first_name',
        'referee.middle_name',
        'referee.last_name',
        'referee.employer',
        'referee.referee_position',
        'referee.email',
        'referee.phone',

        'phone.id',
        'phone.phone_number',

        'training.id',
        'training.name',
        'training.institution',
        'training.started',
        'training.ended',
        'training.attachment',

        'tool.id',
        'tool.name',

        'address.id',
        'address.street',
        'address.city',
        'address.region',

        'language.id',
        'language.name',
        'language.level',

        'knowledge.id',
        'knowledge.name',
        'knowledge.level',

        'proficiency.id',
        'proficiency.name',
        'proficiency.level',

        'personality.id',
        'personality.name',
      ])
      // -------------------------------
      .where('applicant.id = :id', { id: applicantId })
      .getOne();

    return applicant || null;
  }
}