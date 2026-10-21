import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LanguageUnderstands } from 'src/entities/language-understands.entity';
import { LanguageSpeaks } from 'src/entities/language-speaks.entity';
import { LanguageWrites } from 'src/entities/language-writes.entity';
import { LanguageReads } from 'src/entities/language-reads.entity';
import { Languages } from 'src/entities/languages.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantLanguages } from 'src/entities/applicants/applicant-languages.entity';
import { Users } from 'src/entities/users.entity';


import { CreateApplicantLanguageDto } from './dto/create-applicant-language.dto';
import { UpdateApplicantLanguageDto } from './dto/update-applicant-language.dto';

@Injectable()
export class ApplicantLanguagesService {
    constructor(
        @InjectRepository(ApplicantLanguages)
        private readonly applicantLanguagesRepository: Repository<ApplicantLanguages>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Languages)
        private readonly languagesRepository: Repository<Languages>,

        @InjectRepository(LanguageReads)
        private readonly languageReadsRepository: Repository<LanguageReads>,

        @InjectRepository(LanguageWrites)
        private readonly languageWritesRepository: Repository<LanguageWrites>,

        @InjectRepository(LanguageSpeaks)
        private readonly languageSpeaksRepository: Repository<LanguageSpeaks>,

        @InjectRepository(LanguageUnderstands)
        private readonly languageUnderstandsRepository: Repository<LanguageUnderstands>,
    ) { }

    // ============================================================
    // GET APPLICANT FROM CURRENT USER
    // ============================================================

    private async getApplicantByUserId(userId: number) {
        const applicant = await this.applicantsRepository.findOne({
            where: {
                user_id: userId,
            },
        });

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile not found for this user.',
            );
        }

        return applicant;
    }

    // ============================================================
    // CREATE
    // ============================================================

    async create(
        userId: number,
        dto: CreateApplicantLanguageDto,
    ) {
        // Get applicant using authenticated user
        const applicant = await this.getApplicantByUserId(userId);

        // ----------------------------------------------------------
        // Check language
        // ----------------------------------------------------------

        const language = await this.languagesRepository.findOne({
            where: {
                id: dto.language_id,
            },
        });

        if (!language) {
            throw new NotFoundException('Language not found.');
        }

        // ----------------------------------------------------------
        // Prevent duplicate language
        // ----------------------------------------------------------

        const existing =
            await this.applicantLanguagesRepository.findOne({
                where: {
                    applicant_id: applicant.id,
                    language_id: dto.language_id,
                },
            });

        if (existing) {
            throw new ConflictException(
                'This language has already been added to your profile.',
            );
        }

        // ----------------------------------------------------------
        // Check reading level
        // ----------------------------------------------------------

        const read =
            await this.languageReadsRepository.findOne({
                where: {
                    id: dto.read_id,
                },
            });

        if (!read) {
            throw new NotFoundException(
                'Reading level not found.',
            );
        }

        // ----------------------------------------------------------
        // Check writing level
        // ----------------------------------------------------------

        const write =
            await this.languageWritesRepository.findOne({
                where: {
                    id: dto.write_id,
                },
            });

        if (!write) {
            throw new NotFoundException(
                'Writing level not found.',
            );
        }

        // ----------------------------------------------------------
        // Check speaking level
        // ----------------------------------------------------------

        const speak =
            await this.languageSpeaksRepository.findOne({
                where: {
                    id: dto.speak_id,
                },
            });

        if (!speak) {
            throw new NotFoundException(
                'Speaking level not found.',
            );
        }

        // ----------------------------------------------------------
        // Check understanding level
        // ----------------------------------------------------------

        const understand =
            await this.languageUnderstandsRepository.findOne({
                where: {
                    id: dto.understand_id,
                },
            });

        if (!understand) {
            throw new NotFoundException(
                'Understanding level not found.',
            );
        }

        // ----------------------------------------------------------
        // Create applicant language
        // ----------------------------------------------------------

        const applicantLanguage =
            this.applicantLanguagesRepository.create({
                applicant_id: applicant.id,
                language_id: dto.language_id,
                read_id: dto.read_id,
                write_id: dto.write_id,
                speak_id: dto.speak_id,
                understand_id: dto.understand_id,
            });

        const saved =
            await this.applicantLanguagesRepository.save(
                applicantLanguage,
            );

        return {
            status: true,
            message: 'Applicant language saved successfully.',
        
        };
    }

    // ============================================================
    // GET MY LANGUAGES
    // ============================================================

  async findMyLanguages(userId: number) {
  const applicant = await this.getApplicantByUserId(userId);

  const languages =
    await this.applicantLanguagesRepository.find({
      where: {
        applicant_id: applicant.id,
      },
      relations: [
        'language',
        'read',
        'write',
        'speak',
        'understand',
      ],
      order: {
        id: 'DESC',
      },
    });

  const data = languages.map((item) => ({
    id: item.id,

    language: item.language
      ? {
          id: item.language.id,
          name: item.language.language_name,
        }
      : null,

    read: item.read
      ? {
          id: item.read.id,
          name: item.read.read_ability,
        }
      : null,

    write: item.write
      ? {
          id: item.write.id,
          name: item.write.write_ability,
        }
      : null,

    speak: item.speak
      ? {
          id: item.speak.id,
          name: item.speak.speak_ability,
        }
      : null,

    understand: item.understand
      ? {
          id: item.understand.id,
          name: item.understand.understand_ability,
        }
      : null,

    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  return {
    status: true,
    message: 'Applicant languages retrieved successfully.',
    data,
  };
}

    // ============================================================
    // GET ONE OF MY LANGUAGES
    // ============================================================

async findOne(
  userId: number,
  id: number,
) {
  const applicant =
    await this.getApplicantByUserId(userId);

  const applicantLanguage =
    await this.applicantLanguagesRepository.findOne({
      where: {
        id,
        applicant_id: applicant.id,
      },

      relations: [
        'language',
        'read',
        'write',
        'speak',
        'understand',
      ],
    });

  if (!applicantLanguage) {
    throw new NotFoundException(
      'Applicant language not found.',
    );
  }

  const data = {
    id: applicantLanguage.id,

    language: applicantLanguage.language
      ? {
          id: applicantLanguage.language.id,
          name: applicantLanguage.language.language_name,
        }
      : null,

    read: applicantLanguage.read
      ? {
          id: applicantLanguage.read.id,
          name: applicantLanguage.read.read_ability,
        }
      : null,

    write: applicantLanguage.write
      ? {
          id: applicantLanguage.write.id,
          name: applicantLanguage.write.write_ability,
        }
      : null,

    speak: applicantLanguage.speak
      ? {
          id: applicantLanguage.speak.id,
          name: applicantLanguage.speak.speak_ability,
        }
      : null,

    understand: applicantLanguage.understand
      ? {
          id: applicantLanguage.understand.id,
          name: applicantLanguage.understand.understand_ability,
        }
      : null,

    created_at: applicantLanguage.created_at,
    updated_at: applicantLanguage.updated_at,
  };

  return {
    status: true,
    message:
      'Applicant language retrieved successfully.',
    data,
  };
}

    // ============================================================
    // UPDATE
    // ============================================================

    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantLanguageDto,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        // Only allow the current applicant's record
        const applicantLanguage =
            await this.applicantLanguagesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantLanguage) {
            throw new NotFoundException(
                'Applicant language not found.',
            );
        }

        // ----------------------------------------------------------
        // Language
        // ----------------------------------------------------------

        if (dto.language_id !== undefined) {
            const language =
                await this.languagesRepository.findOne({
                    where: {
                        id: dto.language_id,
                    },
                });

            if (!language) {
                throw new NotFoundException(
                    'Language not found.',
                );
            }

            // Prevent duplicate language
            const duplicate =
                await this.applicantLanguagesRepository.findOne({
                    where: {
                        applicant_id: applicant.id,
                        language_id: dto.language_id,
                    },
                });

            if (
                duplicate &&
                duplicate.id !== applicantLanguage.id
            ) {
                throw new ConflictException(
                    'This language has already been added to your profile.',
                );
            }

            applicantLanguage.language_id =
                dto.language_id;
        }

        // ----------------------------------------------------------
        // Reading
        // ----------------------------------------------------------

        if (dto.read_id !== undefined) {
            const read =
                await this.languageReadsRepository.findOne({
                    where: {
                        id: dto.read_id,
                    },
                });

            if (!read) {
                throw new NotFoundException(
                    'Reading level not found.',
                );
            }

            applicantLanguage.read_id =
                dto.read_id;
        }

        // ----------------------------------------------------------
        // Writing
        // ----------------------------------------------------------

        if (dto.write_id !== undefined) {
            const write =
                await this.languageWritesRepository.findOne({
                    where: {
                        id: dto.write_id,
                    },
                });

            if (!write) {
                throw new NotFoundException(
                    'Writing level not found.',
                );
            }

            applicantLanguage.write_id =
                dto.write_id;
        }

        // ----------------------------------------------------------
        // Speaking
        // ----------------------------------------------------------

        if (dto.speak_id !== undefined) {
            const speak =
                await this.languageSpeaksRepository.findOne({
                    where: {
                        id: dto.speak_id,
                    },
                });

            if (!speak) {
                throw new NotFoundException(
                    'Speaking level not found.',
                );
            }

            applicantLanguage.speak_id =
                dto.speak_id;
        }

        // ----------------------------------------------------------
        // Understanding
        // ----------------------------------------------------------

        if (dto.understand_id !== undefined) {
            const understand =
                await this.languageUnderstandsRepository.findOne({
                    where: {
                        id: dto.understand_id,
                    },
                });

            if (!understand) {
                throw new NotFoundException(
                    'Understanding level not found.',
                );
            }

            applicantLanguage.understand_id =
                dto.understand_id;
        }

        const updated =
            await this.applicantLanguagesRepository.save(
                applicantLanguage,
            );

        return {
            status: true,
            message:
                'Applicant language updated successfully.',
           
        };
    }

    // ============================================================
    // DELETE
    // ============================================================

    async remove(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantLanguage =
            await this.applicantLanguagesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantLanguage) {
            throw new NotFoundException(
                'Applicant language not found.',
            );
        }

        await this.applicantLanguagesRepository.remove(
            applicantLanguage,
        );

        return {
            status: true,
            message:
                'Applicant language deleted successfully.',
        };
    }
}