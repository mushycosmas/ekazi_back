import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { SaveApplicantSoftwareDto } from './dto/save-applicant-software.dto';
import { ApplicantSoftware } from 'src/entities/applicants/applicant-software.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Softwares } from 'src/entities/softwares.entity';

@Injectable()
export class ApplicantSoftwareService {
    constructor(
        @InjectRepository(ApplicantSoftware)
        private readonly applicantSoftwareRepository: Repository<ApplicantSoftware>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Softwares)
        private readonly softwaresRepository: Repository<Softwares>,
    ) { }

    // ============================================================
    // GET APPLICANT FROM CURRENT USER
    // ============================================================

    private async getApplicantByUserId(userId: number) {
        const applicant =
            await this.applicantsRepository.findOne({
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
    // NORMALIZE SOFTWARE NAME
    // ============================================================

    private normalizeSoftwareName(
        name: string,
    ): string {
        return name
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase(),
            );
    }

    // ============================================================
    // SAVE MULTIPLE SOFTWARE
    // ============================================================

    async saveSoftware(
        userId: number,
        dto: SaveApplicantSoftwareDto,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        if (!dto.software || dto.software.length === 0) {
            throw new ConflictException(
                'At least one software is required.',
            );
        }

        // ============================================================
        // 1. NORMALIZE AND REMOVE DUPLICATES
        // ============================================================

        const uniqueSoftwareNames = [
            ...new Set(
                dto.software
                    .map((software) =>
                        this.normalizeSoftwareName(software),
                    )
                    .filter(
                        (software) => software.length > 0,
                    ),
            ),
        ];

        if (uniqueSoftwareNames.length === 0) {
            throw new ConflictException(
                'At least one valid software is required.',
            );
        }

        // ============================================================
        // 2. DELETE ALL EXISTING SOFTWARE FOR THIS APPLICANT
        // ============================================================

        await this.applicantSoftwareRepository.delete({
            applicant_id: applicant.id,
        });

        // ============================================================
        // 3. PREPARE RESPONSE
        // ============================================================

        const savedSoftware: {
            id: number;
            software_id: number;
            software_name: string | null;
            created_at: Date | null;
            updated_at: Date | null;
        }[] = [];

        // ============================================================
        // 4. ADD NEW SOFTWARE
        // ============================================================

        for (const softwareName of uniqueSoftwareNames) {

            // ----------------------------------------------------------
            // Check if software already exists globally
            // ----------------------------------------------------------

            let software =
                await this.softwaresRepository
                    .createQueryBuilder('software')
                    .where(
                        'LOWER(software.software_name) = LOWER(:softwareName)',
                        {
                            softwareName,
                        },
                    )
                    .andWhere(
                        'software.deleted_at IS NULL',
                    )
                    .getOne();

            // ----------------------------------------------------------
            // Create global software if it doesn't exist
            // ----------------------------------------------------------

            if (!software) {
                software =
                    this.softwaresRepository.create({
                        software_name: softwareName,
                        hide: false,
                        creator_id: userId,
                        updator_id: userId,
                        deleted_at: null,
                    });

                software =
                    await this.softwaresRepository.save(
                        software,
                    );
            }

            // ----------------------------------------------------------
            // Create applicant/software relationship
            // ----------------------------------------------------------

            const applicantSoftware =
                this.applicantSoftwareRepository.create({
                    applicant_id: applicant.id,
                    software_id: software.id,
                });

            const saved =
                await this.applicantSoftwareRepository.save(
                    applicantSoftware,
                );

            // ----------------------------------------------------------
            // Add to response
            // ----------------------------------------------------------

            savedSoftware.push({
                id: saved.id,
                software_id: software.id,
                software_name: software.software_name,
                created_at: saved.created_at,
                updated_at: saved.updated_at,
            });
        }

        return {
            status: true,
            message:
                'Applicant software updated successfully.',
            data: savedSoftware,
        };
    }

    // ============================================================
    // GET MY SOFTWARE
    // ============================================================

    async findAll(userId: number) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantSoftware =
            await this.applicantSoftwareRepository.find({
                where: {
                    applicant_id: applicant.id,
                },
                relations: ['software'],
                order: {
                    id: 'DESC',
                },
            });

        const data = applicantSoftware.map(
            (item) => ({
                id: item.id,

                software: item.software
                    ? {
                        id: item.software.id,
                        name: item.software.software_name,
                    }
                    : null,

                created_at: item.created_at,
                updated_at: item.updated_at,
            }),
        );

        return {
            status: true,
            message:
                'Applicant software retrieved successfully.',
            data,
        };
    }

    // ============================================================
    // GET ONE
    // ============================================================

    async findOne(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantSoftware =
            await this.applicantSoftwareRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
                relations: ['software'],
            });

        if (!applicantSoftware) {
            throw new NotFoundException(
                'Applicant software not found.',
            );
        }

        return {
            status: true,
            message:
                'Applicant software retrieved successfully.',
            data: {
                id: applicantSoftware.id,

                software: applicantSoftware.software
                    ? {
                        id: applicantSoftware.software.id,
                        name:
                            applicantSoftware.software
                                .software_name,
                    }
                    : null,

                created_at:
                    applicantSoftware.created_at,

                updated_at:
                    applicantSoftware.updated_at,
            },
        };
    }

    // ============================================================
    // DELETE SOFTWARE
    // ============================================================

    async remove(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantSoftware =
            await this.applicantSoftwareRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantSoftware) {
            throw new NotFoundException(
                'Applicant software not found.',
            );
        }

        await this.applicantSoftwareRepository.remove(
            applicantSoftware,
        );

        return {
            status: true,
            message:
                'Applicant software removed successfully.',
        };
    }
}