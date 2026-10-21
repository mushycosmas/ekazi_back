import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantCultures } from 'src/entities/applicants/applicant-cultures.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Cultures } from 'src/entities/cultures.entity';

import { SaveApplicantCulturesDto } from './dto/save-applicant-cultures.dto';

@Injectable()
export class ApplicantCulturesService {
    constructor(
        @InjectRepository(ApplicantCultures)
        private readonly applicantCulturesRepository: Repository<ApplicantCultures>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Cultures)
        private readonly culturesRepository: Repository<Cultures>,
    ) { }

    // =========================================================
    // GET APPLICANT USING CURRENT USER
    // =========================================================
    private async getApplicantByUserId(userId: number): Promise<Applicants> {
        const applicant = await this.applicantsRepository.findOne({
            where: {
                user_id: userId,
            },
        });

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile not found for the current user.',
            );
        }

        return applicant;
    }

    // =========================================================
    // NORMALIZE CULTURE NAME
    // =========================================================
    private normalizeCultureName(value: string): string {
        return value
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    // =========================================================
    // SAVE MULTIPLE CULTURES
    // =========================================================
    async saveCultures(
        userId: number,
        dto: SaveApplicantCulturesDto,
    ) {
        const applicant = await this.getApplicantByUserId(userId);

        if (!dto.cultures || dto.cultures.length === 0) {
            throw new BadRequestException(
                'At least one culture is required.',
            );
        }

        // =========================================================
        // 1. NORMALIZE AND REMOVE DUPLICATES
        // =========================================================
        const cultureNames = [
            ...new Set(
                dto.cultures
                    .filter((culture) => culture && culture.trim())
                    .map((culture) =>
                        this.normalizeCultureName(culture),
                    ),
            ),
        ];

        if (cultureNames.length === 0) {
            throw new BadRequestException(
                'At least one valid culture is required.',
            );
        }

        // =========================================================
        // 2. DELETE ALL CURRENT CULTURES FOR THIS APPLICANT
        // =========================================================
        await this.applicantCulturesRepository.delete({
            applicant_id: applicant.id,
        });

        // =========================================================
        // 3. PREPARE RESPONSE
        // =========================================================
        const savedCultures: {
            id: number;
            culture: {
                id: number;
                name: string | null;
            } | null;
            created_at: Date | null;
            updated_at: Date | null;
        }[] = [];

        // =========================================================
        // 4. ADD NEW CULTURES
        // =========================================================
        for (const cultureName of cultureNames) {

            // -----------------------------------------------------
            // Check if culture already exists globally
            // -----------------------------------------------------
            let culture =
                await this.culturesRepository
                    .createQueryBuilder('culture')
                    .where(
                        'LOWER(culture.culture_name) = LOWER(:cultureName)',
                        {
                            cultureName,
                        },
                    )
                    .andWhere('culture.hide = :hide', {
                        hide: false,
                    })
                    .getOne();

            // -----------------------------------------------------
            // Create culture if it doesn't exist
            // -----------------------------------------------------
            if (!culture) {
                culture = this.culturesRepository.create({
                    culture_name: cultureName,
                    hide: false,
                    creator_id: userId,
                    updator_id: userId,
                });

                culture =
                    await this.culturesRepository.save(culture);
            }

            // -----------------------------------------------------
            // Create applicant/culture relationship
            // -----------------------------------------------------
            const applicantCulture =
                this.applicantCulturesRepository.create({
                    applicant_id: applicant.id,
                    culture_id: culture.id,
                });

            const savedCulture =
                await this.applicantCulturesRepository.save(
                    applicantCulture,
                );

            // -----------------------------------------------------
            // Response
            // -----------------------------------------------------
            savedCultures.push({
                id: savedCulture.id,

                culture: {
                    id: culture.id,
                    name: culture.culture_name,
                },

                created_at: savedCulture.created_at,
                updated_at: savedCulture.updated_at,
            });
        }

        return {
            status: true,
            message: 'Applicant cultures updated successfully.',
            data: savedCultures,
        };
    }

    // =========================================================
    // GET ALL MY CULTURES
    // =========================================================
    async findAll(userId: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const applicantCultures =
            await this.applicantCulturesRepository.find({
                where: {
                    applicant_id: applicant.id,
                },
                relations: ['culture'],
                order: {
                    id: 'DESC',
                },
            });

        return {
            status: true,
            message: 'Applicant cultures retrieved successfully.',
            data: applicantCultures.map((item) => ({
                id: item.id,

                culture: item.culture
                    ? {
                        id: item.culture.id,
                        name: item.culture.culture_name,
                    }
                    : null,

                created_at: item.created_at,
                updated_at: item.updated_at,
            })),
        };
    }

    // =========================================================
    // GET ONE CULTURE
    // =========================================================
    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const applicantCulture =
            await this.applicantCulturesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
                relations: ['culture'],
            });

        if (!applicantCulture) {
            throw new NotFoundException(
                'Applicant culture not found.',
            );
        }

        return {
            status: true,
            message: 'Applicant culture retrieved successfully.',
            data: {
                id: applicantCulture.id,

                culture: applicantCulture.culture
                    ? {
                        id: applicantCulture.culture.id,
                        name: applicantCulture.culture.culture_name,
                    }
                    : null,

                created_at: applicantCulture.created_at,
                updated_at: applicantCulture.updated_at,
            },
        };
    }

    // =========================================================
    // DELETE MY CULTURE
    // =========================================================
    async remove(userId: number, id: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const applicantCulture =
            await this.applicantCulturesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantCulture) {
            throw new NotFoundException(
                'Applicant culture not found.',
            );
        }

        await this.applicantCulturesRepository.remove(
            applicantCulture,
        );

        return {
            status: true,
            message: 'Applicant culture removed successfully.',
        };
    }
}