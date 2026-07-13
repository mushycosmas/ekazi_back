import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateLanguageUnderstandDto } from './dto/create-language-understand.dto';
import { UpdateLanguageUnderstandDto } from './dto/update-language-understand.dto';
import { LanguageUnderstands } from 'src/entities/language-understands.entity';

@Injectable()
export class LanguageUnderstandsService {
  constructor(
    @InjectRepository(LanguageUnderstands)
    private readonly repository: Repository<LanguageUnderstands>,
  ) {}

  // CREATE
  async create(dto: CreateLanguageUnderstandDto) {
    const language = this.repository.create(dto);

    const saved = await this.repository.save(language);

    return {
      success: true,
      message: 'Language understand created successfully.',
      data: {
        id: saved.id,
        understand_ability: saved.understand_ability,
      },
    };
  }

  // Internal helper
  private async findLanguage(id: number): Promise<LanguageUnderstands> {
    const language = await this.repository.findOne({
      where: {
        id,
        hide: false,
      },
    });

    if (!language) {
      throw new NotFoundException('Language understand not found');
    }

    return language;
  }

  // FIND ALL
  async findAll() {
    const languages = await this.repository.find({
      select: {
        id: true,
        understand_ability: true,
      },
      where: {
        hide: false,
      },
      order: {
        understand_ability: 'ASC',
      },
    });

    return {
      success: true,
      message: 'Language understands fetched successfully.',
      data: languages,
    };
  }

  // FIND ONE
  async findOne(id: number) {
    const language = await this.findLanguage(id);

    return {
      success: true,
      message: 'Language understand fetched successfully.',
      data: {
        id: language.id,
        understand_ability: language.understand_ability,
      },
    };
  }

  // UPDATE
  async update(
    id: number,
    dto: UpdateLanguageUnderstandDto,
  ) {
    const language = await this.findLanguage(id);

    Object.assign(language, dto);

    const updated = await this.repository.save(language);

    return {
      success: true,
      message: 'Language understand updated successfully.',
      data: {
        id: updated.id,
        understand_ability: updated.understand_ability,
      },
    };
  }

  // SOFT DELETE
  async remove(id: number) {
    const language = await this.findLanguage(id);

    language.hide = true;

    await this.repository.save(language);

    return {
      success: true,
      message: 'Language understand deleted successfully.',
    };
  }
}