import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ApplicantTrainings } from 'src/entities/applicants/applicant-trainings.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

import { CreateApplicantTrainingDto } from './dto/create-applicant-training.dto';
import { UpdateApplicantTrainingDto } from './dto/update-applicant-training.dto';

@Injectable()
export class ApplicantTrainingsService {
  constructor(
    @InjectRepository(ApplicantTrainings)
    private readonly trainingRepository: Repository<ApplicantTrainings>,

    @InjectRepository(Applicants)
    private readonly applicantsRepository: Repository<Applicants>,

    private readonly dataSource: DataSource,
  ) { }

  private async getApplicant(userId: number): Promise<Applicants> {
    const applicant = await this.applicantsRepository.findOne({
      where: { user_id: userId },
    });

    if (!applicant) {
      throw new NotFoundException(
        'Applicant profile was not found for the authenticated user.',
      );
    }

    return applicant;
  }

  private validateDates(started?: Date | null, ended?: Date | null) {
    if (started && Number.isNaN(new Date(started).getTime())) {
      throw new BadRequestException('Invalid training start date.');
    }

    if (ended && Number.isNaN(new Date(ended).getTime())) {
      throw new BadRequestException('Invalid training end date.');
    }

    if (started && ended && new Date(started) > new Date(ended)) {
      throw new BadRequestException(
        'The training start date cannot be after the end date.',
      );
    }
  }

  private async checkDuplicate(
    applicantId: number,
    name: string,
    institution: string,
    excludeId?: number,
  ): Promise<boolean> {
    const query = this.trainingRepository
      .createQueryBuilder('training')
      .where('training.applicant_id = :applicantId', { applicantId })
      .andWhere('training.hide = :hide', { hide: false })
      .andWhere(
        'LOWER(TRIM(training.name)) = LOWER(TRIM(:name))',
        { name },
      )
      .andWhere(
        'LOWER(TRIM(training.institution)) = LOWER(TRIM(:institution))',
        { institution },
      );

    if (excludeId !== undefined) {
      query.andWhere('training.id != :excludeId', { excludeId });
    }

    return (await query.getOne()) !== null;
  }

  // CREATE
  async create(
    userId: number,
    dto: CreateApplicantTrainingDto,
  ) {
    const applicant = await this.getApplicant(userId);

    const name = dto.name?.trim();
    const institution = dto.institution?.trim();

    if (!name || !institution) {
      throw new BadRequestException(
        'Training name and institution are required.',
      );
    }

    this.validateDates(dto.started, dto.ended);

    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ApplicantTrainings);

      const duplicateQuery = repository
        .createQueryBuilder('training')
        .where('training.applicant_id = :applicantId', {
          applicantId: applicant.id,
        })
        .andWhere('training.hide = :hide', { hide: false })
        .andWhere('LOWER(TRIM(training.name)) = LOWER(TRIM(:name))', {
          name,
        })
        .andWhere(
          'LOWER(TRIM(training.institution)) = LOWER(TRIM(:institution))',
          { institution },
        );

      if (await duplicateQuery.getOne()) {
        throw new BadRequestException(
          'This training record already exists for the applicant.',
        );
      }

      const training = repository.create({
        applicant_id: applicant.id,
        name,
        institution,
        description: dto.description?.trim() || null,
        started: dto.started ? new Date(dto.started) : null,
        ended: dto.ended ? new Date(dto.ended) : null,
        attachment: dto.attachment?.trim() || null,
        hide: false,
      });

      const saved = await repository.save(training);

      return {
        message: 'Applicant training created successfully.',
        data: saved,
      };
    });
  }

  // GET ALL
  async findAll(userId: number) {
    const applicant = await this.getApplicant(userId);

    const records = await this.trainingRepository.find({
      where: {
        applicant_id: applicant.id,
        hide: false,
      },
      order: {
        started: 'DESC',
        id: 'DESC',
      },
    });

    return {
      message: 'Applicant trainings retrieved successfully.',
      data: records,
    };
  }

  async findAllTrainingsPaginated(
    page = 1,
    limit = 20,
  ) {
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    const [records, total] = await this.trainingRepository.findAndCount({
      where: {
        hide: false,
      },
      order: {
        started: 'DESC',
        id: 'DESC',
      },
      skip: (currentPage - 1) * perPage,
      take: perPage,
    });

    return {
      success: true,
      message: 'All trainings retrieved successfully.',
      data: records,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),

    };
  }

  // GET ONE
  async findOne(userId: number, id: number) {
    const applicant = await this.getApplicant(userId);

    const training = await this.trainingRepository.findOne({
      where: {
        id,
        applicant_id: applicant.id,
        hide: false,
      },
    });

    if (!training) {
      throw new NotFoundException('Training record was not found.');
    }

    return {
      message: 'Applicant training retrieved successfully.',
      data: training,
    };
  }

  // PATCH
  async update(
    userId: number,
    id: number,
    dto: UpdateApplicantTrainingDto,
  ) {
    const applicant = await this.getApplicant(userId);

    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ApplicantTrainings);

      const training = await repository.findOne({
        where: {
          id,
          applicant_id: applicant.id,
          hide: false,
        },
      });

      if (!training) {
        throw new NotFoundException('Training record was not found.');
      }

      const name =
        dto.name !== undefined ? dto.name.trim() : training.name;

      const institution =
        dto.institution !== undefined
          ? dto.institution.trim()
          : training.institution;

      if (!name || !institution) {
        throw new BadRequestException(
          'Training name and institution cannot be empty.',
        );
      }

      const started =
        dto.started !== undefined
          ? dto.started
          : training.started;

      const ended =
        dto.ended !== undefined
          ? dto.ended
          : training.ended;

      this.validateDates(started, ended);

      const duplicate = await repository
        .createQueryBuilder('record')
        .where('record.applicant_id = :applicantId', {
          applicantId: applicant.id,
        })
        .andWhere('record.hide = :hide', { hide: false })
        .andWhere('record.id != :id', { id })
        .andWhere('LOWER(TRIM(record.name)) = LOWER(TRIM(:name))', {
          name,
        })
        .andWhere(
          'LOWER(TRIM(record.institution)) = LOWER(TRIM(:institution))',
          { institution },
        )
        .getOne();

      if (duplicate) {
        throw new BadRequestException(
          'Another training record with the same name and institution already exists.',
        );
      }

      training.name = name;
      training.institution = institution;

      if (dto.description !== undefined) {
        training.description = dto.description?.trim() || null;
      }

      if (dto.started !== undefined) {
        training.started = dto.started
          ? new Date(dto.started)
          : null;
      }

      if (dto.ended !== undefined) {
        training.ended = dto.ended
          ? new Date(dto.ended)
          : null;
      }

      if (dto.attachment !== undefined) {
        training.attachment = dto.attachment?.trim() || null;
      }

      const saved = await repository.save(training);

      return {
        message: 'Applicant training updated successfully.',
        data: saved,
      };
    });
  }

  // DELETE
  async remove(userId: number, id: number) {
    const applicant = await this.getApplicant(userId);

    const training = await this.trainingRepository.findOne({
      where: {
        id,
        applicant_id: applicant.id,
        hide: false,
      },
    });

    if (!training) {
      throw new NotFoundException('Training record was not found.');
    }

    await this.trainingRepository.remove(training);

    return {
      id,
      message: 'Applicant training deleted successfully.',
    };
  }
}