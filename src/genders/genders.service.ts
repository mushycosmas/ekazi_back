import { Injectable } from '@nestjs/common';
import { Genders } from 'src/entities/genders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GendersService {
      constructor(
    @InjectRepository(Genders)
    private readonly genderRepository: Repository<Genders>,
  ) {}

  async findAll() {
    try {
      const genders = await this.genderRepository.find({
        order: {
          id: 'DESC',
        },
      });

      const data = genders.map((gender) => ({
        id: gender.id,
        name: gender.gender_name,
      }));

      return {
        success: true,
        message: 'Genders fetched successfully',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch genders',
        error: error.message,
      });
    }
  }
}
