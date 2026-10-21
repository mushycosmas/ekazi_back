
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Positions } from 'src/entities/positions.entity';
import { ApplicantEmployers } from 'src/entities/applicants/applicant-employers.entity';

import { CreateApplicantPositionDto } from './dto/create-applicant-position.dto';
import { UpdateApplicantPositionDto } from './dto/update-applicant-position.dto';

@Injectable()
export class ApplicantPositionsService {
    constructor(
        @InjectRepository(ApplicantPositions)
        private readonly applicantPositionsRepo: Repository<ApplicantPositions>,

        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,

        @InjectRepository(Positions)
        private readonly positionsRepo: Repository<Positions>,

        @InjectRepository(ApplicantEmployers)
        private readonly applicantEmployersRepo: Repository<ApplicantEmployers>,
    ) { }

    private async getApplicant(userId: number): Promise<Applicants> {
        const applicant = await this.applicantsRepo.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile was not found.');
        }

        return applicant;
    }

    private validateId(value: unknown, field: string): number {
        const id = Number(value);

        if (!Number.isSafeInteger(id) || id < 1) {
            throw new BadRequestException(
                `${field} must be a positive integer ID or a valid name.`,
            );
        }

        return id;
    }

    private slugify(value: string): string {
        return value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Existing position ID -> use it.
     * Position name -> find existing name or create a new position.
     */
    private async resolvePosition(
        value: number | string,
        userId: number,
        industryId: number | null,
    ): Promise<Positions> {
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(
                'position_id or position name is required.',
            );
        }

        if (typeof value === 'number') {
            const id = this.validateId(value, 'position_id');

            const position = await this.positionsRepo.findOne({
                where: { id },
            });

            if (!position) {
                throw new NotFoundException(`Position ${id} was not found.`);
            }

            return position;
        }

        if (typeof value !== 'string' || !value.trim()) {
            throw new BadRequestException('A valid position name is required.');
        }

        const name = value.trim();

        if (/^\d+$/.test(name)) {
            const id = this.validateId(name, 'position_id');
            const position = await this.positionsRepo.findOne({
                where: { id },
            });

            if (!position) {
                throw new NotFoundException(`Position ${id} was not found.`);
            }

            return position;
        }

        if (name.length > 100) {
            throw new BadRequestException(
                'Position name cannot exceed 100 characters.',
            );
        }

        let position = await this.positionsRepo
            .createQueryBuilder('position')
            .where('LOWER(TRIM(position.position_name)) = LOWER(:name)', { name })
            .getOne();

        if (!position) {
            const slug = this.slugify(name);

            position = this.positionsRepo.create({
                position_name: name,
                slug,
                creator_id: userId,
                updator_id: userId,
                industry_id: industryId,
                hide: 0,
            });

            position = await this.positionsRepo.save(position);
        }

        return position;
    }

    /**
     * Existing employer ID -> use it.
     * Employer name -> find existing employer or create a new one.
     *
     * A new employer needs region_id and sub_location because those
     * columns are required by the ApplicantEmployers entity.
     */
    private async resolveEmployer(
        value: number | string,
        regionId?: number | null,
        subLocation?: string | null,
    ): Promise<ApplicantEmployers> {
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(
                'applicant_employer_id or employer name is required.',
            );
        }

        if (typeof value === 'number') {
            const id = this.validateId(value, 'applicant_employer_id');

            const employer = await this.applicantEmployersRepo.findOne({
                where: { id },
            });

            if (!employer) {
                throw new NotFoundException(`Employer ${id} was not found.`);
            }

            return employer;
        }

        if (typeof value !== 'string' || !value.trim()) {
            throw new BadRequestException('A valid employer name is required.');
        }

        const name = value.trim();

        if (/^\d+$/.test(name)) {
            const id = this.validateId(name, 'applicant_employer_id');

            const employer = await this.applicantEmployersRepo.findOne({
                where: { id },
            });

            if (!employer) {
                throw new NotFoundException(`Employer ${id} was not found.`);
            }

            return employer;
        }

        if (name.length > 200) {
            throw new BadRequestException(
                'Employer name cannot exceed 200 characters.',
            );
        }

        let employer = await this.applicantEmployersRepo
            .createQueryBuilder('employer')
            .where('LOWER(TRIM(employer.employer_name)) = LOWER(:name)', { name })
            .getOne();

        if (!employer) {
            const validRegionId = Number(regionId);
            const location = subLocation?.trim();

            if (
                !Number.isSafeInteger(validRegionId) ||
                validRegionId < 1 ||
                !location
            ) {
                throw new BadRequestException(
                    'To create a new employer, provide a valid region_id and sub_location.',
                );
            }

            employer = this.applicantEmployersRepo.create({
                employer_name: name,
                region_id: validRegionId,
                sub_location: location,
            });

            employer = await this.applicantEmployersRepo.save(employer);
        }

        return employer;
    }

    private validateDates(startDate?: Date | null, endDate?: Date | null) {
        if (startDate && Number.isNaN(new Date(startDate).getTime())) {
            throw new BadRequestException('start_date must be a valid date.');
        }

        if (endDate && Number.isNaN(new Date(endDate).getTime())) {
            throw new BadRequestException('end_date must be a valid date.');
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            throw new BadRequestException(
                'end_date cannot be earlier than start_date.',
            );
        }
    }


    private async findOwnedRecord(
        id: number,
        applicantId: number,
    ): Promise<ApplicantPositions> {
        const record = await this.applicantPositionsRepo.findOne({
            where: {
                id,
                applicant_id: applicantId,
            },
            relations: [
                'position',
                'applicant_employer',
                'industry',
                'position_level',
                'region',
                'region.country',
                'start_salary',
                'end_salary',
            ],
        });

        if (!record) {
            throw new NotFoundException(
                'Applicant position record was not found.',
            );
        }

        return record;
    }



    private format(record: ApplicantPositions) {
        return {
            id: record.id,
            applicant_id: record.applicant_id,

            position_id: record.position_id,
            position: record.position
                ? {
                    id: record.position.id,
                    position_name: record.position.position_name,
                    slug: record.position.slug,
                }
                : null,

            applicant_employer_id: record.applicant_employer_id,
            applicant_employer: record.applicant_employer
                ? {
                    id: record.applicant_employer.id,
                    employer_name: record.applicant_employer.employer_name,
                    region_id: record.applicant_employer.region_id,
                    sub_location: record.applicant_employer.sub_location,
                }
                : null,

            industry_id: record.industry_id,
            industry: record.industry
                ? {
                    id: record.industry.id,
                    industry_name: record.industry.industry_name,
                }
                : null,

            position_level_id: record.position_level_id,
            position_level: record.position_level,

            salary_id: record.salary_id,

            start_salary_id: record.start_salary_id,
            start_salary: record.start_salary,

            end_salary_id: record.end_salary_id,
            end_salary: record.end_salary,

            responsibility: record.responsibility,
            remark: record.remark,
            start_date: record.start_date,
            end_date: record.end_date,

            region_id: record.region_id,
            region: record.region
                ? {
                    id: record.region.id,
                    region_name: record.region.region_name,
                    country_id: record.region.country_id,
                    country: record.region.country
                        ? {
                            id: record.region.country.id,
                            name: record.region.country.name,
                            citizenship: record.region.country.citizenship,
                            country_code: record.region.country.country_code,
                            alpha_code: record.region.country.alpha_code,
                            currency: record.region.country.currency,
                        }
                        : null,
                }
                : null,

            sub_location: record.sub_location,
            created_at: record.created_at,
            updated_at: record.updated_at,
        };
    }



    async create(userId: number, dto: CreateApplicantPositionDto) {
        const applicant = await this.getApplicant(userId);

        const position = await this.resolvePosition(
            dto.position_id,
            userId,
            dto.industry_id,
        );

        const employer = await this.resolveEmployer(
            dto.applicant_employer_id,
            dto.region_id,
            dto.sub_location,
        );

        // Convert ISO date strings into JavaScript Date objects.
        const startDate = new Date(dto.start_date);
        const endDate = dto.end_date ? new Date(dto.end_date) : null;

        // Validate the converted dates.
        this.validateDates(startDate, endDate);

        const record = this.applicantPositionsRepo.create({
            applicant_id: applicant.id,

            position_id: position.id,
            position,

            applicant_employer_id: employer.id,
            applicant_employer: employer,

            industry_id: dto.industry_id,
            position_level_id: dto.position_level_id,
            salary_id: dto.salary_id ?? null,

            responsibility: dto.responsibility.trim(),
            remark: dto.remark.trim(),

            start_salary_id: dto.start_salary_id,
            end_salary_id: dto.end_salary_id,

            // Correct placement: dates are fields of the entity object.
            start_date: startDate,
            end_date: endDate,

            region_id: dto.region_id,
            sub_location: dto.sub_location.trim(),
        });

        const saved = await this.applicantPositionsRepo.save(record);

        const result = await this.findOwnedRecord(saved.id, applicant.id);

        return {
            success: true,
            message: 'Applicant position created successfully.',
            data: this.format(result),
        };
    }


    async findAll(userId: number) {
        const applicant = await this.getApplicant(userId);

        const records = await this.applicantPositionsRepo.find({
            where: { applicant_id: applicant.id },
            relations: [
                'position',
                'applicant_employer',
                'industry',
                'position_level',
                'region',
                'region.country',
                'start_salary',
                'end_salary',
            ],
            order: { id: 'DESC' },
        });

        return {
            success: true,
            data: records.map((record) => this.format(record)),

        };
    }


    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);

        console.log('Authenticated user ID:', userId);
        console.log('Resolved applicant ID:', applicant.id);
        console.log('Requested position record ID:', id);

        // Find the record belonging to the authenticated applicant
        // and load all relations required by format().
        const record = await this.applicantPositionsRepo.findOne({
            where: {
                id,
                applicant_id: applicant.id,
            },
            relations: [
                'position',
                'applicant_employer',
                'industry',
                'position_level',
                'region',
                'region.country',
                'start_salary',
                'end_salary',
            ],
        });

        if (!record) {
            throw new NotFoundException(
                `Applicant position record ${id} was not found for applicant ${applicant.id}.`,
            );
        }

        return {
            success: true,
            data: [this.format(record)],
        };
    }


    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantPositionDto,
    ) {
        const applicant = await this.getApplicant(userId);
        const record = await this.findOwnedRecord(id, applicant.id);

        const nextIndustryId = dto.industry_id ?? record.industry_id;

        if (dto.position_id !== undefined) {
            const position = await this.resolvePosition(
                dto.position_id,
                userId,
                nextIndustryId,
            );

            record.position_id = position.id;
            record.position = position;
        }

        if (dto.applicant_employer_id !== undefined) {
            // For a new employer name, reuse the existing employment location
            // unless the request provides updated region/location values.
            const employer = await this.resolveEmployer(
                dto.applicant_employer_id,
                dto.region_id ?? record.region_id,
                dto.sub_location ?? record.sub_location,
            );

            record.applicant_employer_id = employer.id;
            record.applicant_employer = employer;
        }

        if (dto.industry_id !== undefined) {
            record.industry_id = dto.industry_id;
        }

        if (dto.position_level_id !== undefined) {
            record.position_level_id = dto.position_level_id;
        }

        if (dto.salary_id !== undefined) {
            record.salary_id = dto.salary_id;
        }

        if (dto.responsibility !== undefined) {
            record.responsibility = dto.responsibility.trim();
        }

        if (dto.remark !== undefined) {
            record.remark = dto.remark.trim();
        }

        if (dto.start_salary_id !== undefined) {
            record.start_salary_id = dto.start_salary_id;
        }

        if (dto.end_salary_id !== undefined) {
            record.end_salary_id = dto.end_salary_id;
        }


        if (dto.start_date !== undefined) {
            record.start_date = new Date(dto.start_date);
        }

        if (dto.end_date !== undefined) {
            record.end_date = dto.end_date
                ? new Date(dto.end_date)
                : null;
        }


        if (dto.region_id !== undefined) {
            record.region_id = dto.region_id;
        }

        if (dto.sub_location !== undefined) {
            record.sub_location = dto.sub_location.trim();
        }

        this.validateDates(record.start_date, record.end_date);

        const saved = await this.applicantPositionsRepo.save(record);
        const result = await this.findOwnedRecord(saved.id, applicant.id);

        return {
            success: true,
            message: 'Applicant position updated successfully.',
            data: this.format(result),
        };
    }

    async remove(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);
        const record = await this.findOwnedRecord(id, applicant.id);

        await this.applicantPositionsRepo.remove(record);

        return {
            success: true,
            message: 'Applicant position deleted successfully.',
        };
    }
}
