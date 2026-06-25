import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobRequirements } from '../entities/job-requirements.entity';
import { Repository } from 'typeorm';
import { CreateJobRequirementDto } from '../dtos/create-job-requirement.dto';
import { UpdateJobRequirementDto } from '../dtos/update-job-requirement.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class JobRequirementsService {
      constructor(
    @InjectRepository(JobRequirements)
    private readonly jobRequirementsRepository: Repository<JobRequirements>,
  ) {}

  async create(createDto: CreateJobRequirementDto) {
    const requirement =
      this.jobRequirementsRepository.create(createDto);

    const data =
      await this.jobRequirementsRepository.save(requirement);

    return {
      message: 'Job requirement created successfully',
      status: true,
      data,
    };
  }

  async findAll() {
    const data = await this.jobRequirementsRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return {
      message: 'Job requirements fetched successfully',
      status: true,
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.jobRequirementsRepository.findOne({
      where: { id },
    
    });

    if (!data) {
      throw new NotFoundException(
        `Job requirement with ID ${id} not found`,
      );
    }

    return {
      message: 'Job requirement fetched successfully',
      status: true,
      data,
    };
  }

  async update(
    id: number,
    updateDto: UpdateJobRequirementDto,
  ) {
    const requirement =
      await this.jobRequirementsRepository.findOne({
        where: { id },
      });

    if (!requirement) {
      throw new NotFoundException(
        `Job requirement with ID ${id} not found`,
      );
    }

    Object.assign(requirement, updateDto);

    const data =
      await this.jobRequirementsRepository.save(
        requirement,
      );

    return {
      message: 'Job requirement updated successfully',
      status: true,
      data,
    };
  }

  async remove(id: number) {
    const requirement =
      await this.jobRequirementsRepository.findOne({
        where: { id },
      });

    if (!requirement) {
      throw new NotFoundException(
        `Job requirement with ID ${id} not found`,
      );
    }

    await this.jobRequirementsRepository.remove(
      requirement,
    );

    return {
      message: 'Job requirement deleted successfully',
      status: true,
    };
  }
}
