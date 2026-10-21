import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantReferees } from 'src/entities/applicants/applicant-referees.entity';

import { CreateApplicantRefereeDto } from './dto/create-applicant-referee.dto';
import { UpdateApplicantRefereeDto } from './dto/update-applicant-referee.dto';

@Injectable()
export class ApplicantRefereesService {
    constructor(
        @InjectRepository(ApplicantReferees)
        private readonly applicantRefereesRepository: Repository<ApplicantReferees>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
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
    // CREATE REFEREE
    // ============================================================


    private capitalizeName(value?: string | null): string | null {
        if (!value || !value.trim()) {
            return null;
        }

        return value
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    async create(
        userId: number,
        dto: CreateApplicantRefereeDto,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const referee =
            this.applicantRefereesRepository.create({
                applicant_id: applicant.id,

                first_name: this.capitalizeName(dto.first_name),
                middle_name: this.capitalizeName(dto.middle_name),
                last_name: this.capitalizeName(dto.last_name),

                employer: dto.employer?.trim() ?? null,
                referee_position: dto.referee_position?.trim() ?? null,
                email: dto.email?.trim() ?? null,
                phone: dto.phone?.trim() ?? null,
                type: dto.type?.trim() ?? null,
            });

        const saved =
            await this.applicantRefereesRepository.save(referee);

        return {
            status: true,
            message: 'Applicant referee saved successfully.',
            data: {
                id: saved.id,
                first_name: saved.first_name,
                middle_name: saved.middle_name,
                last_name: saved.last_name,
                employer: saved.employer,
                referee_position: saved.referee_position,
                email: saved.email,
                phone: saved.phone,
                type: saved.type,
                created_at: saved.created_at,
                updated_at: saved.updated_at,
            },
        };
    }

    // ============================================================
    // GET MY REFEREES
    // ============================================================

    async findAll(userId: number) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const referees =
            await this.applicantRefereesRepository.find({
                where: {
                    applicant_id: applicant.id,
                },
                order: {
                    id: 'DESC',
                },
            });

        const data = referees.map((referee) => ({
            id: referee.id,

            first_name: this.capitalizeName(
                referee.first_name,
            ),

            middle_name: this.capitalizeName(
                referee.middle_name,
            ),

            last_name: this.capitalizeName(
                referee.last_name,
            ),

            employer: referee.employer,
            referee_position: referee.referee_position,
            email: referee.email,
            phone: referee.phone,
            type: referee.type,

            created_at: referee.created_at,
            updated_at: referee.updated_at,
        }));

        return {
            status: true,
            message: 'Applicant referees retrieved successfully.',
            data,
        };
    }

    // ============================================================
    // GET ONE REFEREE
    // ============================================================

    async findOne(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const referee =
            await this.applicantRefereesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!referee) {
            throw new NotFoundException(
                'Applicant referee not found.',
            );
        }

        return {
            status: true,
            message: 'Applicant referee retrieved successfully.',

            data: {
                id: referee.id,

                first_name: this.capitalizeName(
                    referee.first_name,
                ),

                middle_name: this.capitalizeName(
                    referee.middle_name,
                ),

                last_name: this.capitalizeName(
                    referee.last_name,
                ),

                employer: referee.employer,
                referee_position: referee.referee_position,
                email: referee.email,
                phone: referee.phone,
                type: referee.type,

                created_at: referee.created_at,
                updated_at: referee.updated_at,
            },
        };
    }

    // ============================================================
    // UPDATE REFEREE
    // ============================================================

    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantRefereeDto,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const referee =
            await this.applicantRefereesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!referee) {
            throw new NotFoundException(
                'Applicant referee not found.',
            );
        }

        if (dto.first_name !== undefined) {
            referee.first_name =
                this.capitalizeName(dto.first_name);
        }

        if (dto.middle_name !== undefined) {
            referee.middle_name =
                this.capitalizeName(dto.middle_name);
        }

        if (dto.last_name !== undefined) {
            referee.last_name =
                this.capitalizeName(dto.last_name);
        }

        if (dto.employer !== undefined) {
            referee.employer = dto.employer;
        }

        if (dto.referee_position !== undefined) {
            referee.referee_position =
                dto.referee_position;
        }

        if (dto.email !== undefined) {
            referee.email = dto.email;
        }

        if (dto.phone !== undefined) {
            referee.phone = dto.phone;
        }

        if (dto.type !== undefined) {
            referee.type = dto.type;
        }

        const updated =
            await this.applicantRefereesRepository.save(
                referee,
            );

        return {
            status: true,
            message: 'Applicant referee updated successfully.',
            data: {
                id: updated.id,
                first_name: updated.first_name,
                middle_name: updated.middle_name,
                last_name: updated.last_name,
                employer: updated.employer,
                referee_position: updated.referee_position,
                email: updated.email,
                phone: updated.phone,
                type: updated.type,
                created_at: updated.created_at,
                updated_at: updated.updated_at,
            },
        };
    }

    // ============================================================
    // DELETE REFEREE
    // ============================================================

    async remove(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const referee =
            await this.applicantRefereesRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!referee) {
            throw new NotFoundException(
                'Applicant referee not found.',
            );
        }

        await this.applicantRefereesRepository.remove(
            referee,
        );

        return {
            status: true,
            message: 'Applicant referee deleted successfully.',
        };
    }
}