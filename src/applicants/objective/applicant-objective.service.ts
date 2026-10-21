 import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { ApplicantObjective } from 'src/entities/applicants/applicant-objective.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';

import { SaveApplicantObjectiveDto } from './dto/save-applicant-objective.dto';

@Injectable()
export class ApplicantObjectivesService {
  constructor(
    @InjectRepository(ApplicantObjective)
    private readonly applicantObjectivesRepository: Repository<ApplicantObjective>,

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
  // CREATE / UPDATE OBJECTIVE
  // ============================================================

  async saveObjective(
    userId: number,
    dto: SaveApplicantObjectiveDto,
  ) {
    const applicant =
      await this.getApplicantByUserId(userId);

    // ==========================================================
    // VALIDATE OBJECTIVE
    // ==========================================================

    const objective = dto.objective?.trim();

    if (!objective) {
      throw new BadRequestException(
        'Objective is required.',
      );
    }

    // ==========================================================
    // CHECK EXISTING OBJECTIVE
    // ==========================================================

    let applicantObjective =
      await this.applicantObjectivesRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    // ==========================================================
    // CREATE
    // ==========================================================

    if (!applicantObjective) {
      applicantObjective =
        this.applicantObjectivesRepository.create({
          applicant_id: applicant.id,
          objective,
        });
    }

    // ==========================================================
    // UPDATE
    // ==========================================================

    else {
      applicantObjective.objective = objective;
    }

    // ==========================================================
    // SAVE
    // ==========================================================

    applicantObjective =
      await this.applicantObjectivesRepository.save(
        applicantObjective,
      );

    return {
      status: true,
      message:
        'Applicant objective saved successfully.',
      data: {
        id: applicantObjective.id,
        objective: applicantObjective.objective,
        created_at:
          applicantObjective.created_at,
        updated_at:
          applicantObjective.updated_at,
      },
    };
  }

  // ============================================================
  // GET MY OBJECTIVE
  // ============================================================

  async findOne(userId: number) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantObjective =
      await this.applicantObjectivesRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    if (!applicantObjective) {
      throw new NotFoundException(
        'Applicant objective not found.',
      );
    }

    return {
      status: true,
      message:
        'Applicant objective retrieved successfully.',
      data: {
        id: applicantObjective.id,
        objective: applicantObjective.objective,
        created_at:
          applicantObjective.created_at,
        updated_at:
          applicantObjective.updated_at,
      },
    };
  }

  // ============================================================
  // DELETE MY OBJECTIVE
  // ============================================================

  async remove(userId: number) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantObjective =
      await this.applicantObjectivesRepository.findOne({
        where: {
          applicant_id: applicant.id,
        },
      });

    if (!applicantObjective) {
      throw new NotFoundException(
        'Applicant objective not found.',
      );
    }

    await this.applicantObjectivesRepository.remove(
      applicantObjective,
    );

    return {
      status: true,
      message:
        'Applicant objective removed successfully.',
    };
  }
}