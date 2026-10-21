
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantProficiencies } from 'src/entities/applicants/applicant-proficiencies.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Organizations } from 'src/entities/organizations.entity';
import { Proficiencies } from 'src/entities/proficiencies.entity';

import { CreateApplicantProficiencyDto } from './dto/create-applicant-proficiency.dto';
import { UpdateApplicantProficiencyDto } from './dto/update-applicant-proficiency.dto';

@Injectable()
export class ApplicantProficienciesService {
    constructor(
        @InjectRepository(ApplicantProficiencies)
        private readonly applicantProficienciesRepo: Repository<ApplicantProficiencies>,

        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,

        @InjectRepository(Organizations)
        private readonly organizationsRepo: Repository<Organizations>,

        @InjectRepository(Proficiencies)
        private readonly proficienciesRepo: Repository<Proficiencies>,
    ) { }

    /**
     * Resolve the authenticated user's applicant profile.
     * The frontend must not supply applicant_id.
     */
    private async getApplicant(userId: number): Promise<Applicants> {
        const applicant = await this.applicantsRepo.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile was not found for this user.',
            );
        }

        return applicant;
    }

    private normalizeName(value: unknown, field: string): string {
        if (typeof value !== 'string' || !value.trim()) {
            throw new BadRequestException(`${field} name is required.`);
        }

        return value.trim();
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

    /**
     * Accepts an existing organization ID or a new organization name.
     */
    private async resolveOrganization(
        value: number | string,
    ): Promise<Organizations> {
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(
                'organization_id or organization name is required.',
            );
        }

        if (typeof value === 'number') {
            const id = this.validateId(value, 'organization_id');

            const organization = await this.organizationsRepo.findOne({
                where: { id },
            });

            if (!organization) {
                throw new NotFoundException(
                    `Organization with ID ${id} was not found.`,
                );
            }

            return organization;
        }

        if (typeof value !== 'string') {
            throw new BadRequestException(
                'organization_id must be a positive ID or organization name.',
            );
        }

        const name = this.normalizeName(value, 'Organization');

        // A numeric string should be treated as an ID, not a name.
        if (/^\d+$/.test(name)) {
            const id = this.validateId(name, 'organization_id');

            const organization = await this.organizationsRepo.findOne({
                where: { id },
            });

            if (!organization) {
                throw new NotFoundException(
                    `Organization with ID ${id} was not found.`,
                );
            }

            return organization;
        }

        let organization = await this.organizationsRepo
            .createQueryBuilder('organization')
            .where('LOWER(TRIM(organization.organization_name)) = LOWER(:name)', {
                name,
            })
            .getOne();

        if (!organization) {
            organization = this.organizationsRepo.create({
                organization_name: name,
            });

            organization = await this.organizationsRepo.save(organization);
        }

        return organization;
    }

    /**
     * Accepts an existing proficiency ID or a new proficiency name.
     */
    private async resolveProficiency(
        value: number | string,
    ): Promise<Proficiencies> {
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(
                'proficiency_id or proficiency name is required.',
            );
        }

        if (typeof value === 'number') {
            const id = this.validateId(value, 'proficiency_id');

            const proficiency = await this.proficienciesRepo.findOne({
                where: { id },
            });

            if (!proficiency) {
                throw new NotFoundException(
                    `Proficiency with ID ${id} was not found.`,
                );
            }

            return proficiency;
        }

        if (typeof value !== 'string') {
            throw new BadRequestException(
                'proficiency_id must be a positive ID or proficiency name.',
            );
        }

        const name = this.normalizeName(value, 'Proficiency');

        if (/^\d+$/.test(name)) {
            const id = this.validateId(name, 'proficiency_id');

            const proficiency = await this.proficienciesRepo.findOne({
                where: { id },
            });

            if (!proficiency) {
                throw new NotFoundException(
                    `Proficiency with ID ${id} was not found.`,
                );
            }

            return proficiency;
        }

        let proficiency = await this.proficienciesRepo
            .createQueryBuilder('proficiency')
            .where('LOWER(TRIM(proficiency.proficiency_name)) = LOWER(:name)', {
                name,
            })
            .getOne();

        if (!proficiency) {
            proficiency = this.proficienciesRepo.create({
                proficiency_name: name,
            });

            proficiency = await this.proficienciesRepo.save(proficiency);
        }

        return proficiency;
    }

    private validateDates(started?: Date | null, ended?: Date | null): void {
        if (started && Number.isNaN(new Date(started).getTime())) {
            throw new BadRequestException('started must be a valid date.');
        }

        if (ended && Number.isNaN(new Date(ended).getTime())) {
            throw new BadRequestException('ended must be a valid date.');
        }

        if (started && ended && new Date(ended) < new Date(started)) {
            throw new BadRequestException(
                'ended cannot be earlier than started.',
            );
        }
    }

    private async findOwnedRecord(
        id: number,
        applicantId: number,
    ): Promise<ApplicantProficiencies> {
        const record = await this.applicantProficienciesRepo.findOne({
            where: {
                id,
                applicant_id: applicantId,
            },
            relations: ['organization', 'proficiency'],
        });

        if (!record) {
            throw new NotFoundException(
                'Applicant proficiency record was not found.',
            );
        }

        return record;
    }

    private format(record: ApplicantProficiencies) {
        return {
            id: record.id,
            applicant_id: record.applicant_id,
            organization_id: record.organization_id,
            organization: record.organization
                ? {
                    id: record.organization.id,
                    organization_name: record.organization.organization_name,
                }
                : null,
            proficiency_id: record.proficiency_id,
            proficiency: record.proficiency
                ? {
                    id: record.proficiency.id,
                    proficiency_name: record.proficiency.proficiency_name,
                }
                : null,
            started: record.started,
            ended: record.ended,
            course: record.course,
            award: record.award,
            attachment: record.attachment,
            created_at: record.created_at,
            updated_at: record.updated_at,
        };
    }

    async create(
        userId: number,
        dto: CreateApplicantProficiencyDto,
        attachment?: string,
    ) {
        const applicant = await this.getApplicant(userId);

        const organization = await this.resolveOrganization(dto.organization_id);
        const proficiency = await this.resolveProficiency(dto.proficiency_id);

        this.validateDates(dto.started, dto.ended);

        const course = dto.course?.trim() || null;
        const award = dto.award?.trim() || null;

        // Avoid creating duplicate records for the same applicant.
        const duplicateQuery = this.applicantProficienciesRepo
            .createQueryBuilder('item')
            .where('item.applicant_id = :applicantId', {
                applicantId: applicant.id,
            })
            .andWhere('item.organization_id = :organizationId', {
                organizationId: organization.id,
            })
            .andWhere('item.proficiency_id = :proficiencyId', {
                proficiencyId: proficiency.id,
            });

        course === null
            ? duplicateQuery.andWhere('item.course IS NULL')
            : duplicateQuery.andWhere('LOWER(TRIM(item.course)) = LOWER(:course)', {
                course,
            });

        award === null
            ? duplicateQuery.andWhere('item.award IS NULL')
            : duplicateQuery.andWhere('LOWER(TRIM(item.award)) = LOWER(:award)', {
                award,
            });

        if (await duplicateQuery.getOne()) {
            throw new BadRequestException(
                'This proficiency record already exists in your profile.',
            );
        }

        const record = this.applicantProficienciesRepo.create({
            applicant_id: applicant.id,
            organization_id: organization.id,
            proficiency_id: proficiency.id,
            started: dto.started ?? null,
            ended: dto.ended ?? null,
            course,
            award,
            attachment: attachment ?? null,
        });

        const saved = await this.applicantProficienciesRepo.save(record);

        const result = await this.findOwnedRecord(saved.id, applicant.id);

        return {
            success: true,
            message: 'Applicant proficiency created successfully.',
            data: this.format(result),
        };
    }

    async findAll(userId: number) {
        const applicant = await this.getApplicant(userId);

        const records = await this.applicantProficienciesRepo.find({
            where: { applicant_id: applicant.id },
            relations: ['organization', 'proficiency'],
            order: { id: 'DESC' },
        });

        return {
            success: true,
            data: records.map((record) => this.format(record)),
         
        };
    }

    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);
        const record = await this.findOwnedRecord(id, applicant.id);

        return {
            success: true,
            data: this.format(record),
        };
    }


    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantProficiencyDto,
        attachment?: string,
    ) {
        const applicant = await this.getApplicant(userId);
        const record = await this.findOwnedRecord(id, applicant.id);

        // Update organization using an existing ID or a name.
        if (dto.organization_id !== undefined) {
            const organization = await this.resolveOrganization(
                dto.organization_id,
            );

            // Update both the foreign key and the loaded relation.
            record.organization_id = organization.id;
            record.organization = organization;
        }

        // Update proficiency using an existing ID or a name.
        if (dto.proficiency_id !== undefined) {
            const proficiency = await this.resolveProficiency(
                dto.proficiency_id,
            );

            record.proficiency_id = proficiency.id;
            record.proficiency = proficiency;
        }

        if (dto.started !== undefined) {
            record.started = dto.started;
        }

        if (dto.ended !== undefined) {
            record.ended = dto.ended;
        }

        if (dto.course !== undefined) {
            record.course = dto.course.trim() || null;
        }

        if (dto.award !== undefined) {
            record.award = dto.award.trim() || null;
        }

        if (attachment !== undefined) {
            record.attachment = attachment;
        }

        this.validateDates(record.started, record.ended);

        const saved = await this.applicantProficienciesRepo.save(record);

        // Reload the record so the response contains the updated relation.
        const updatedRecord = await this.findOwnedRecord(
            saved.id,
            applicant.id,
        );

        return {
            success: true,
            message: 'Applicant proficiency updated successfully.',
            data: this.format(updatedRecord),
        };
    }


    async remove(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);
        const record = await this.findOwnedRecord(id, applicant.id);

        await this.applicantProficienciesRepo.remove(record);

        return {
            success: true,
            message: 'Applicant proficiency deleted successfully.',
        };
    }
}
