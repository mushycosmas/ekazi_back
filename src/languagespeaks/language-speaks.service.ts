import { Injectable } from '@nestjs/common';
import { LanguageSpeaks } from 'src/entities/language-speaks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class LanguageSpeaksService {
     constructor(
    @InjectRepository(LanguageSpeaks)
    private readonly languageSpeakRepository: Repository<LanguageSpeaks>,
  ) {}

  async findAll() {
    try {
      const data = await this.languageSpeakRepository.find({
        where: {
          hide: false,
        },
        order: {
          id: 'DESC',
        },
      });

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.speak_ability,
      }));

      return {
        success: true,
        message: 'Language speak abilities fetched successfully',
        data: formatted,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch language speaks',
        error: error.message,
      });
    }
  }
}
