import { Injectable } from '@nestjs/common';
import { LanguageReads } from 'src/entities/language-reads.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class LanguagesReadsService {
      constructor(
    @InjectRepository(LanguageReads)
    private readonly languageReadRepository: Repository<LanguageReads>,
  ) {}

  async findAll() {
    try {
      const data = await this.languageReadRepository.find({
        where: {
          hide: false,
        },
        order: {
          id: 'DESC',
        },
      });

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.read_ability,
      }));

      return {
        success: true,
        message: 'Language read abilities fetched successfully',
        data: formatted,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch language reads',
        error: error.message,
      });
    }
  }
}
