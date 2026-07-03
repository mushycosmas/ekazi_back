import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stage } from 'src/entities/stage.entity';
import { Repository } from 'typeorm';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { Users } from 'src/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class StagesService {
     constructor(
    @InjectRepository(Stage)
    private readonly repository: Repository<Stage>,
  ) {}

  async create(dto: CreateStageDto, user: Users) {
    const stage = this.repository.create({
      ...dto,
      creator_id: user.id,
      updator_id: user.id,
    });

    const data = await this.repository.save(stage);

    return {
      success: true,
      message: 'Stage created successfully',
      data,
    };
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.repository
        .createQueryBuilder('stage')
        .orderBy('stage.id', 'DESC');

      if (search) {
        query.where(
          `stage.stage_name LIKE :search
          OR stage.stage_code LIKE :search`,
          {
            search: `%${search}%`,
          },
        );
      }

      const total = await query.getCount();

      const stages = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = stages.map(
        ({ created_at, updated_at, ...rest }) => rest,
      );

      return {
        success: true,
        message: 'Stages retrieved successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    const stage = await this.repository.findOne({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    const { created_at, updated_at, ...data } = stage;

    return {
      success: true,
      message: 'Stage retrieved successfully',
      data,
    };
  }

  async update(
    id: number,
    dto: UpdateStageDto,
    user: Users,
  ) {
    const stage = await this.repository.findOne({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    Object.assign(stage, dto);
    stage.updator_id = user.id;

    const data = await this.repository.save(stage);

    return {
      success: true,
      message: 'Stage updated successfully',
      data,
    };
  }

  async remove(id: number) {
    const stage = await this.repository.findOne({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    await this.repository.remove(stage);

    return {
      success: true,
      message: 'Stage deleted successfully',
    };
  }
}
