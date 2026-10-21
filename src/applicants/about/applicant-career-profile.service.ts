 import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantCareers } from 'src/entities/applicants/applicant-careers.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';

import { SaveApplicantCareerDto } from './dto/save-applicant-career.dto';

@Injectable()
export class ApplicantCareersService {
  constructor(
    @InjectRepository(ApplicantCareers)
    private readonly applicantCareersRepository: Repository<ApplicantCareers>,

    @InjectRepository(Applicants)
    private readonly applicantsRepository: Repository<Applicants>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  // ============================================================
  // GET APPLICANT FROM CURRENT USER
  // ============================================================

  private async getApplicantByUserId(
    userId: number,
  ): Promise<Applicants> {
    const applicant =
      await this.applicantsRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!applicant) {
      throw new NotFoundException(
        'Applicant profile not found for this user.',
      );
    }

    return applicant;
  }

  // ============================================================
  // SAVE / UPDATE CAREER
  // ============================================================

  async saveCareer(
    userId: number,
    dto: SaveApplicantCareerDto,
  ) {
    const applicant =
      await this.getApplicantByUserId(userId);

    // ==========================================================
    // VALIDATE CAREER
    // ==========================================================

    const career = dto.career?.trim();

    if (!career) {
      throw new BadRequestException(
        'Career is required.',
      );
    }

    // ==========================================================
    // CHECK EXISTING CAREER
    // ==========================================================

    let applicantCareer =
      await this.applicantCareersRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    // ==========================================================
    // CREATE CAREER
    // ==========================================================

    if (!applicantCareer) {
      applicantCareer =
        this.applicantCareersRepository.create({
          applicant_id: applicant.id,
          career,
        });
    }

    // ==========================================================
    // UPDATE EXISTING CAREER
    // ==========================================================

    else {
      applicantCareer.career = career;
    }

    // ==========================================================
    // SAVE
    // ==========================================================

    applicantCareer =
      await this.applicantCareersRepository.save(
        applicantCareer,
      );

    return {
      status: true,
      message: 'Applicant career saved successfully.',
      data: {
        id: applicantCareer.id,
        career: applicantCareer.career,
        created_at: applicantCareer.created_at,
        updated_at: applicantCareer.updated_at,
      },
    };
  }

  // ============================================================
  // GET MY CAREER
  // ============================================================

  async findOne(userId: number) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantCareer =
      await this.applicantCareersRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    if (!applicantCareer) {
      throw new NotFoundException(
        'Applicant career not found.',
      );
    }

    return {
      status: true,
      message:
        'Applicant career retrieved successfully.',
      data: {
        id: applicantCareer.id,
        career: applicantCareer.career,
        created_at: applicantCareer.created_at,
        updated_at: applicantCareer.updated_at,
      },
    };
  }

  // ============================================================
  // DELETE MY CAREER
  // ============================================================

  async remove(userId: number) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantCareer =
      await this.applicantCareersRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    if (!applicantCareer) {
      throw new NotFoundException(
        'Applicant career not found.',
      );
    }

    await this.applicantCareersRepository.remove(
      applicantCareer,
    );

    return {
      status: true,
      message:
        'Applicant career removed successfully.',
    };
  }
}