import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobLanguages } from '../entities/job-languages.entity';
import { Repository } from 'typeorm';
import { CreateJobLanguagesDto } from '../dtos/create-job-languages.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateJobLanguagesDto } from '../dtos/update-job-languages.dto';

@Injectable()
export class JobLanguagesService {
      constructor(
    @InjectRepository(JobLanguages)
    private repo: Repository<JobLanguages>,
  ) {}

  // CREATE
  async create(dto: CreateJobLanguagesDto) {
    const entity = this.repo.create({
      ...dto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      message: 'Job language created successfully',
      data: await this.repo.save(entity),
    };
  }

  // FIND ALL
  async findAll() {
    return this.repo.find({
      relations: [
        'job',
        'language',
        'read',
        'write',
        'speak',
        'understand',
      ],
      order: { id: 'DESC' },
    });
  }

  // FIND ONE
  async findOne(id: number) {
    const data = await this.repo.findOne({
      where: { id },
      relations: [
        'job',
        'language',
        'read',
        'write',
        'speak',
        'understand',
      ],
    });

    if (!data) throw new NotFoundException('Job language not found');

    return data;
  }

  // UPDATE (IMPORTANT PART)
  async update(id: number, dto: UpdateJobLanguagesDto) {
    const entity = await this.findOne(id);

    const {
      job_id,
      language_id,
      read_id,
      write_id,
      speak_id,
      understand_id,
      ...rest
    } = dto;

    // normal fields (none here but safe)
    Object.assign(entity, rest);

    // relations mapping (VERY IMPORTANT)
    if (job_id) {
      entity.job = { id: job_id } as any;
    }

    if (language_id) {
      entity.language = { id: language_id } as any;
    }

    if (read_id) {
      entity.read = { id: read_id } as any;
    }

    if (write_id) {
      entity.write = { id: write_id } as any;
    }

    if (speak_id) {
      entity.speak = { id: speak_id } as any;
    }

    if (understand_id) {
      entity.understand = { id: understand_id } as any;
    }

    entity.updated_at = new Date();

    const updated = await this.repo.save(entity);

    return {
      success: true,
      message: 'Job language updated successfully',
    };
  }

  // DELETE
  async remove(id: number) {
    const entity = await this.findOne(id);

    await this.repo.remove(entity);

    return {
      success: true,
      message: 'Job language deleted successfully',
    };
  }
}
