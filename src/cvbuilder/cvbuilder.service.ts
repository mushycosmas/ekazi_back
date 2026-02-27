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
import { ApplicantSoftware } from 'src/entities/applicants/applicant-software.entity';
import { ApplicantProficiencies } from 'src/entities/applicants/applicant-proficiencies.entity';
import { ApplicantTrainings } from 'src/entities/applicants/applicant-trainings.entity';
import { ApplicantEducation } from 'src/entities/applicants/applicant-education.entity';
import { ApplicantLanguages } from 'src/entities/applicants/applicant-languages.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';

@Injectable()
export class CvbuilderService {
  constructor(
    @InjectRepository(Applicants)
    private readonly applicantsRepo: Repository<Applicants>,
    private readonly dataSource: DataSource,
  ) {}

  async getApplicantCv(applicantId: number) {
    // ---------------- Step 1: Load basic applicant ----------------
    const applicant = await this.applicantsRepo
      .createQueryBuilder('applicant')
      .leftJoinAndSelect('applicant.user', 'user')
      .leftJoinAndSelect('applicant.marital', 'marital')
      .leftJoinAndSelect('applicant.gender', 'gender')
      .where('applicant.id = :id', { id: applicantId })
      .getOne();

    if (!applicant) throw new NotFoundException('Applicant not found');

    // ---------------- Step 2: Load all sections in parallel ----------------
    const [
      careers,
      tools,
      phones,
      referees,
      cultures,
      knowledge,
      software,
      proficiencies,
      trainings,
      education,
      languages,
      positions,
    ] = await Promise.all([
      this.getCareers(applicantId),
      this.getTools(applicantId),
      this.getPhones(applicantId),
      this.getReferees(applicantId),
      this.getCultures(applicantId),
      this.getKnowledge(applicantId),
      this.getSoftware(applicantId),
      this.getProficiencies(applicantId),
      this.getTrainings(applicantId),
      this.getEducation(applicantId),
      this.getLanguages(applicantId),
      this.getPositions(applicantId),
    ]);

    // ---------------- Step 3: Return nested applicant structure ----------------
    return {
      ...applicant,
      applicant_career: careers,
      applicant_tools: tools,
      applicant_phones: phones,
      referees: referees,
      applicant_cultures: cultures,
      applicant_knowledge: knowledge,
      applicant_software: software,
      applicant_proficiencies: proficiencies,
      applicant_trainings: trainings,
      applicant_education: education,
      applicant_languages: languages,
      positions: positions,
      marital_status: applicant.marital?.marital_status,
      current_position: positions.length ? positions[0] : null,
    };
  }

  // ---------------- Section Queries ----------------
  private async getCareers(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantCareers)
      .createQueryBuilder('career')
      .where('career.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getTools(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantTools)
      .createQueryBuilder('at')
      .leftJoinAndSelect('at.tools', 'tool')
      .where('at.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getPhones(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantPhones)
      .createQueryBuilder('phone')
      .where('phone.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getReferees(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantReferees)
      .createQueryBuilder('ref')
      .where('ref.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getCultures(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantCultures)
      .createQueryBuilder('ac')
      .leftJoinAndSelect('ac.culture', 'culture')
      .where('ac.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getKnowledge(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantKnowledge)
      .createQueryBuilder('ak')
      .leftJoinAndSelect('ak.knowledge', 'knowledge')
      .where('ak.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getSoftware(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantSoftware)
      .createQueryBuilder('asw')
      .leftJoinAndSelect('asw.software', 'software')
      .where('asw.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getProficiencies(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantProficiencies)
      .createQueryBuilder('ap')
      .leftJoinAndSelect('ap.proficiency', 'prof')
      .leftJoinAndSelect('ap.organization', 'org')
      .where('ap.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getTrainings(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantTrainings)
      .createQueryBuilder('at')
      .where('at.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getEducation(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantEducation)
      .createQueryBuilder('ae')
      .leftJoinAndSelect('ae.college', 'college')
      .leftJoinAndSelect('ae.major', 'major')
      .leftJoinAndSelect('ae.education_level', 'level')
      .leftJoinAndSelect('ae.course', 'course')
      .where('ae.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getLanguages(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantLanguages)
      .createQueryBuilder('al')
      .leftJoinAndSelect('al.language', 'language')
      .where('al.applicant_id = :id', { id: applicantId })
      .getMany();
  }

  private async getPositions(applicantId: number) {
    return this.dataSource
      .getRepository(ApplicantPositions)
      .createQueryBuilder('pos')
      .leftJoinAndSelect('pos.position', 'position')
      .leftJoinAndSelect('pos.industry', 'industry')
      .leftJoinAndSelect('pos.level', 'level')
      .leftJoinAndSelect('pos.employer', 'employer')
      .leftJoinAndSelect('employer.region', 'region')
      .leftJoinAndSelect('region.country', 'country')
      .where('pos.applicant_id = :id', { id: applicantId })
      .orderBy('pos.id', 'DESC')
      .getMany();
  }
}