import { Injectable } from '@nestjs/common';
import { MaritalStatuses } from 'src/entities/marital-statuses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MalitalStatusesService {
     constructor(
    @InjectRepository(MaritalStatuses)
    private readonly maritalStatusRepository: Repository<MaritalStatuses>,
  ) {}

  async findAll() {
    try {
      const maritalStatuses = await this.maritalStatusRepository.find({
        where: {
          hide: false,
        },
        order: {
          id: 'DESC',
        },
      });

      const data = maritalStatuses.map((item) => ({
        id: item.id,
        name: item.marital_status,
      }));

      return {
        success: true,
        message: 'Marital statuses fetched successfully',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch marital statuses',
        error: error.message,
      });
    }
  }
}
