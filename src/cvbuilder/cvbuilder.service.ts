import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantCareers } from 'src/entities/applicants/applicant-careers.entity';
import { ApplicantTools } from 'src/entities/applicants/applicant-tools.entity';
import { ApplicantPhones } from 'src/entities/applicants/applicant-phones.entity';
import { ApplicantReferees } from 'src/entities/applicants/applicant-referees.entity';
import { ApplicantCultures } from 'src/entities/applicants/applicant-cultures.entity';
import { ApplicantKnowledge } from 'src/entities/applicants/applicant-knowledge.entity';

@Injectable()
export class CvbuilderService {
  constructor(
    @InjectRepository(Applicants)
    private readonly applicantsRepo: Repository<Applicants>,
    private readonly dataSource: DataSource,
  ) {}

  async getApplicantCv(applicantId: number) {
    // ---------------- Step 1: main applicant ----------------
    const applicant = await this.applicantsRepo
      .createQueryBuilder('applicant')
      .leftJoinAndSelect('applicant.user', 'user')
      .leftJoinAndSelect('applicant.marital', 'marital')
      .leftJoinAndSelect('applicant.gender', 'gender')
      .select([
        'applicant.id',
        'applicant.first_name',
        'applicant.middle_name',
        'applicant.last_name',
        'applicant.dob',
        'applicant.picture',
        'applicant.background_picture',
        'user.email',
        'marital.marital_status',
        'gender.gender_name',
      ])
      .where('applicant.id = :id', { id: applicantId })
      .getOne();

    if (!applicant) throw new NotFoundException('Applicant not found');

    // ---------------- Step 2: parallel section queries ----------------
    const [
      careers,
      tools,
      phones,
      referees,
      cultures,
      knowledge,
    ] = await Promise.all([
      this.getCareers(applicantId),
      this.getTools(applicantId),
      this.getPhones(applicantId),
      this.getReferees(applicantId),
      this.getCultures(applicantId),
      this.getKnowledge(applicantId),
    ]);

    // ---------------- Step 3: structured response ----------------
    return {
      applicant,
      careers,
      tools,
      phones,
      referees,
      cultures,
      knowledge,
      marital_status: applicant.marital?.marital_status,
      current_position: applicant['currentPosition'] || null,
    };
  }

  // ---------------- Section Queries ----------------
  private async getCareers(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantCareers)
      .createQueryBuilder('career')
      .select(['career.id', 'career.career'])
      .where('career.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getTools(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantTools)
      .createQueryBuilder('at')
      .leftJoinAndSelect('at.tools', 'tool')
      .select(['tool.id', 'tool.tool_name'])
      .where('at.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getPhones(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantPhones)
      .createQueryBuilder('phone')
      .select(['phone.id', 'phone.phone_number'])
      .where('phone.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getReferees(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantReferees)
      .createQueryBuilder('ref')
      .select([
        'ref.id',
        'ref.first_name',
        'ref.middle_name',
        'ref.last_name',
        'ref.employer',
        'ref.referee_position',
        'ref.email',
        'ref.phone',
      ])
      .where('ref.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getCultures(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantCultures)
      .createQueryBuilder('ac')
      .leftJoinAndSelect('ac.culture', 'culture')
      .select(['culture.id', 'culture.culture_name'])
      .where('ac.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getKnowledge(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantKnowledge)
      .createQueryBuilder('ak')
      .leftJoinAndSelect('ak.knowledge', 'knowledge')
      .select(['knowledge.id', 'knowledge.knowledge_name'])
      .where('ak.applicant_id = :id', { id: applicantId })
      .getMany();
  }
}