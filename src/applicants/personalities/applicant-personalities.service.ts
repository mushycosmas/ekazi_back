import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantPersonalities } from 'src/entities/applicants/applicant-personalities.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Personalities } from 'src/entities/personalities.entity';

import { SaveApplicantPersonalitiesDto } from './dto/save-applicant-personalities.dto';

interface SavedApplicantPersonality {
    id: number;
    personality: {
        id: number;
        name: string | null;
    } | null;
    created_at: Date | null;
    updated_at: Date | null;
}

@Injectable()
export class ApplicantPersonalitiesService {
    constructor(
        @InjectRepository(ApplicantPersonalities)
        private readonly applicantPersonalitiesRepository: Repository<ApplicantPersonalities>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Personalities)
        private readonly personalitiesRepository: Repository<Personalities>,
    ) { }

    // =========================================================
    // GET APPLICANT BY CURRENT USER
    // =========================================================
    private async getApplicantByUserId(
        userId: number,
    ): Promise<Applicants> {
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
    // NORMALIZE PERSONALITY NAME
    // =========================================================
    private normalizePersonalityName(value: string): string {
        return value
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    // =========================================================
    // SAVE MULTIPLE PERSONALITIES
    // =========================================================
async savePersonalities(
    userId: number,
    dto: SaveApplicantPersonalitiesDto,
) {
    const applicant = await this.getApplicantByUserId(userId);

    if (!dto.personalities || dto.personalities.length === 0) {
        throw new BadRequestException(
            'At least one personality is required.',
        );
    }

    // ============================================================
    // 1. NORMALIZE AND REMOVE DUPLICATES
    // ============================================================

    const uniquePersonalityNames = [
        ...new Set(
            dto.personalities
                .map((personality) =>
                    this.normalizePersonalityName(personality),
                )
                .filter(
                    (personality) =>
                        personality.length > 0,
                ),
        ),
    ];

    if (uniquePersonalityNames.length === 0) {
        throw new BadRequestException(
            'At least one valid personality is required.',
        );
    }

    // ============================================================
    // 2. DELETE ALL EXISTING PERSONALITIES FOR THIS APPLICANT
    // ============================================================

    await this.applicantPersonalitiesRepository.delete({
        applicant_id: applicant.id,
    });

    // ============================================================
    // 3. PREPARE RESPONSE
    // ============================================================

    const savedPersonalities: {
        id: number;
        personality: {
            id: number;
            name: string | null;
        } | null;
        created_at: Date | null;
        updated_at: Date | null;
    }[] = [];

    // ============================================================
    // 4. ADD NEW PERSONALITIES
    // ============================================================

    for (const personalityName of uniquePersonalityNames) {

        // ----------------------------------------------------------
        // Check if personality already exists globally
        // ----------------------------------------------------------

        let personality =
            await this.personalitiesRepository
                .createQueryBuilder('personality')
                .where(
                    'LOWER(personality.personality_name) = LOWER(:personalityName)',
                    {
                        personalityName,
                    },
                )
                .andWhere(
                    'personality.hide = :hide',
                    {
                        hide: false,
                    },
                )
                .andWhere(
                    'personality.deleted_at IS NULL',
                )
                .getOne();

        // ----------------------------------------------------------
        // Create global personality if it doesn't exist
        // ----------------------------------------------------------

        if (!personality) {
            personality =
                this.personalitiesRepository.create({
                    personality_name: personalityName,
                    hide: false,
                    creator_id: userId,
                    updator_id: userId,
                    deleted_at: null,
                });

            personality =
                await this.personalitiesRepository.save(
                    personality,
                );
        }

        // ----------------------------------------------------------
        // Create applicant/personality relationship
        // ----------------------------------------------------------

        const applicantPersonality =
            this.applicantPersonalitiesRepository.create({
                applicant_id: applicant.id,
                personality_id: personality.id,
            });

        const saved =
            await this.applicantPersonalitiesRepository.save(
                applicantPersonality,
            );

        // ----------------------------------------------------------
        // Add to response
        // ----------------------------------------------------------

        savedPersonalities.push({
            id: saved.id,

            personality: {
                id: personality.id,
                name: personality.personality_name,
            },

            created_at: saved.created_at,
            updated_at: saved.updated_at,
        });
    }

    return {
        status: true,
        message: 'Applicant personalities updated successfully.',
        data: savedPersonalities,
    };
}


    // =========================================================
    // GET ALL MY PERSONALITIES
    // =========================================================
    async findAll(userId: number) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantPersonalities =
            await this.applicantPersonalitiesRepository.find({
                where: {
                    applicant_id: applicant.id,
                },
                relations: ['personality'],
                order: {
                    id: 'DESC',
                },
            });

        return {
            status: true,
            message:
                'Applicant personalities retrieved successfully.',

            data: applicantPersonalities.map((item) => ({
                id: item.id,

                personality: item.personality
                    ? {
                        id: item.personality.id,
                        name: item.personality.personality_name,
                    }
                    : null,

                created_at: item.created_at,
                updated_at: item.updated_at,
            })),
        };
    }

    // =========================================================
    // GET ONE
    // =========================================================
    async findOne(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantPersonality =
            await this.applicantPersonalitiesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
                relations: ['personality'],
            });

        if (!applicantPersonality) {
            throw new NotFoundException(
                'Applicant personality not found.',
            );
        }

        return {
            status: true,
            message:
                'Applicant personality retrieved successfully.',

            data: {
                id: applicantPersonality.id,

                personality:
                    applicantPersonality.personality
                        ? {
                            id:
                                applicantPersonality.personality.id,
                            name:
                                applicantPersonality.personality
                                    .personality_name,
                        }
                        : null,

                created_at:
                    applicantPersonality.created_at,

                updated_at:
                    applicantPersonality.updated_at,
            },
        };
    }

    // =========================================================
    // DELETE
    // =========================================================
    async remove(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantPersonality =
            await this.applicantPersonalitiesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantPersonality) {
            throw new NotFoundException(
                'Applicant personality not found.',
            );
        }

        await this.applicantPersonalitiesRepository.remove(
            applicantPersonality,
        );

        return {
            status: true,
            message:
                'Applicant personality removed successfully.',
        };
    }
    async updatePersonalities(
        userId: number,
        dto: SaveApplicantPersonalitiesDto,
    ) {
        const applicant = await this.getApplicantByUserId(userId);

        if (!dto.personalities || dto.personalities.length === 0) {
            throw new BadRequestException(
                'At least one personality is required.',
            );
        }

        // Normalize and remove duplicates
        const personalityNames = [
            ...new Set(
                dto.personalities
                    .filter(
                        (personality) =>
                            personality && personality.trim(),
                    )
                    .map((personality) =>
                        this.normalizePersonalityName(personality),
                    ),
            ),
        ];

        if (personalityNames.length === 0) {
            throw new BadRequestException(
                'At least one valid personality is required.',
            );
        }

        // =========================================================
        // 1. DELETE ALL CURRENT PERSONALITIES FOR THIS APPLICANT
        // =========================================================

        await this.applicantPersonalitiesRepository.delete({
            applicant_id: applicant.id,
        });

        const savedPersonalities: {
            id: number;
            personality: {
                id: number;
                name: string | null;
            } | null;
            created_at: Date | null;
            updated_at: Date | null;
        }[] = [];

        // =========================================================
        // 2. ADD THE NEW PERSONALITIES
        // =========================================================

        for (const personalityName of personalityNames) {

            // Check if personality already exists
            let personality =
                await this.personalitiesRepository
                    .createQueryBuilder('personality')
                    .where(
                        'LOWER(personality.personality_name) = LOWER(:personalityName)',
                        {
                            personalityName,
                        },
                    )
                    .andWhere('personality.hide = :hide', {
                        hide: false,
                    })
                    .andWhere('personality.deleted_at IS NULL')
                    .getOne();

            // =======================================================
            // 3. CREATE GLOBAL PERSONALITY IF IT DOES NOT EXIST
            // =======================================================

            if (!personality) {
                personality =
                    this.personalitiesRepository.create({
                        personality_name: personalityName,
                        hide: false,
                        creator_id: userId,
                        updator_id: userId,
                        deleted_at: null,
                    });

                personality =
                    await this.personalitiesRepository.save(
                        personality,
                    );
            }

            // =======================================================
            // 4. CREATE APPLICANT/PERSONALITY RELATIONSHIP
            // =======================================================

            const applicantPersonality =
                this.applicantPersonalitiesRepository.create({
                    applicant_id: applicant.id,
                    personality_id: personality.id,
                });

            const saved =
                await this.applicantPersonalitiesRepository.save(
                    applicantPersonality,
                );

            // =======================================================
            // 5. RESPONSE
            // =======================================================

            savedPersonalities.push({
                id: saved.id,

                personality: {
                    id: personality.id,
                    name: personality.personality_name,
                },

                created_at: saved.created_at,
                updated_at: saved.updated_at,
            });
        }

        return {
            status: true,
            message: 'Applicant personalities updated successfully.',
            data: savedPersonalities,
        };
    }
}