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

  // Fetch full applicant CV
  async getApplicantCv(applicantId: number) {
    const applicant = await this.applicantsRepo.findOne({
      where: { id: applicantId },
      relations: [
        'user',
        'marital',
        'gender',
        // 'applicant_cultures',
        //  'applicant_languages',
        //  'positions',
        // 'applicant_education',
        // 'applicant_career',
        // 'applicant_trainings',
        //  'referees',
        // 'applicant_tools',
        // 'applicant_software',
        //  'applicant_knowledge',
        // 'applicant_proficiencies',
        // 'addresses',
        'applicant_phones',
        // 'applicant_personalities',
      ],
    });

    if (!applicant) {
      return null;
    }

    return applicant;
  }
}