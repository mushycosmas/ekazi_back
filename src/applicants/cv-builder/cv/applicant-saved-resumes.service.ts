 import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantSavedResumes } from
  'src/entities/applicants/applicant-cv-template.entity';
import { Applicants } from
  'src/entities/applicants/applicants.entity';

import { CreateSavedResumeDto } from './dto/create-saved-resume.dto';
import { UpdateSavedResumeDto } from './dto/update-saved-resume.dto';

@Injectable()
export class ApplicantSavedResumesService {
  constructor(
    @InjectRepository(ApplicantSavedResumes)
    private readonly resumesRepository: Repository<ApplicantSavedResumes>,

    @InjectRepository(Applicants)
    private readonly applicantsRepository: Repository<Applicants>,
  ) {}

  // Resolve the applicant from the authenticated user's ID
  private async getApplicantId(userId: number): Promise<number> {
    const applicant = await this.applicantsRepository.findOne({
      select: { id: true },
      where: { user_id: userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return applicant.id;
  }

  // CREATE
  async create(userId: number, dto: CreateSavedResumeDto) {
    const applicantId = await this.getApplicantId(userId);

    const resume = this.resumesRepository.create({
      applicant_id: applicantId,
      template: dto.template ?? null,
      cv_name: dto.cv_name ?? null,
    });

    const savedResume = await this.resumesRepository.save(resume);

    return {
      success: true,
      message: 'Resume saved successfully',
      data: savedResume,
    };
  }

  // READ ALL: current applicant's saved resumes
  async findAll(userId: number) {
    const applicantId = await this.getApplicantId(userId);

    const resumes = await this.resumesRepository.find({
      where: { applicant_id: applicantId },
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      data: resumes,
    };
  }

  // READ ONE: only if the resume belongs to the current applicant
  async findOne(userId: number, id: number) {
    const applicantId = await this.getApplicantId(userId);

    const resume = await this.resumesRepository.findOne({
      where: {
        id,
        applicant_id: applicantId,
      },
    });

    if (!resume) {
      throw new NotFoundException('Saved resume not found');
    }

    return {
      success: true,
      data: resume,
    };
  }

  // UPDATE: only the current applicant's resume
  async update(
    userId: number,
    id: number,
    dto: UpdateSavedResumeDto,
  ) {
    const applicantId = await this.getApplicantId(userId);

    const resume = await this.resumesRepository.findOne({
      where: {
        id,
        applicant_id: applicantId,
      },
    });

    if (!resume) {
      throw new NotFoundException('Saved resume not found');
    }

    if (dto.template !== undefined) {
      resume.template = dto.template;
    }

    if (dto.cv_name !== undefined) {
      resume.cv_name = dto.cv_name;
    }

    const updatedResume = await this.resumesRepository.save(resume);

    return {
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume,
    };
  }

  // DELETE: only the current applicant's resume
  async remove(userId: number, id: number) {
    const applicantId = await this.getApplicantId(userId);

    const resume = await this.resumesRepository.findOne({
      where: {
        id,
        applicant_id: applicantId,
      },
    });

    if (!resume) {
      throw new NotFoundException('Saved resume not found');
    }

    await this.resumesRepository.remove(resume);

    return {
      success: true,
      message: 'Resume deleted successfully',
    };
  }
}