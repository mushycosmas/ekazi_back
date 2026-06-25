import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOtherRequirements } from '../entities/job-other-requirements.entity';
import { CreateJobOtherRequirementDto } from '../dtos/create-job-other-requirement.dto';
import { UpdateJobOtherRequirementDto } from '../dtos/update-job-other-requirement.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class JobOtherRequirementsService {
     constructor(
    @InjectRepository(JobOtherRequirements)
    private readonly repository: Repository<JobOtherRequirements>,
  ) {}

  async create(createDto: CreateJobOtherRequirementDto) {
    const item = this.repository.create(createDto);

    const data = await this.repository.save(item);

    return {
      message: 'Job other requirement created successfully',
      status: true,
      data,
    };
  }

  async findAll() {
    const data = await this.repository.find({
      order: {
        id: 'DESC',
      },
    });

    return {
      message: 'Job other requirements fetched successfully',
      status: true,
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException(
        'Job other requirement not found',
      );
    }

    return {
      message: 'Job other requirement fetched successfully',
      status: true,
      data,
    };
  }

  async update(
    id: number,
    updateDto: UpdateJobOtherRequirementDto,
  ) {
    const item = await this.repository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(
        'Job other requirement not found',
      );
    }

    Object.assign(item, updateDto);

    const data = await this.repository.save(item);

    return {
      message: 'Job other requirement updated successfully',
      status: true,
      data,
    };
  }

  async remove(id: number) {
    const item = await this.repository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(
        'Job other requirement not found',
      );
    }

    await this.repository.remove(item);

    return {
      message: 'Job other requirement deleted successfully',
      status: true,
    };
  }
}
