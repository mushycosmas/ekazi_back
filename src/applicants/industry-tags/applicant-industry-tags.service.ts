import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantIndustryTags } from
    'src/entities/applicants/applicant-industry-tags.entity';

import { Applicants } from
    'src/entities/applicants/applicants.entity';

import { CreateApplicantIndustryTagDto } from
    './dto/create-applicant-industry-tag.dto';

import { UpdateApplicantIndustryTagDto } from
    './dto/update-applicant-industry-tag.dto';

@Injectable()
export class ApplicantIndustryTagsService {
    constructor(
        @InjectRepository(ApplicantIndustryTags)
        private readonly tagsRepo: Repository<ApplicantIndustryTags>,

        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,
    ) { }

    private async getApplicant(userId: number) {
        const applicant = await this.applicantsRepo.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile not found',
            );
        }

        return applicant;
    }

    private async findOwnedTag(
        id: number,
        applicantId: number,
    ) {
        const tag = await this.tagsRepo.findOne({
            where: {
                id,
                applicant_id: applicantId,
            },
        });

        if (!tag) {
            throw new NotFoundException(
                'Industry tag not found',
            );
        }

        return tag;
    }

    async create(
        userId: number,
        dto: CreateApplicantIndustryTagDto,
    ) {
        const applicant = await this.getApplicant(userId);

        const tag = this.tagsRepo.create({
            applicant_id: applicant.id,
            industry_id: dto.industry_id,
            tag_name: dto.tag_name.trim(),
        });

        const saved = await this.tagsRepo.save(tag);

        return {
            success: true,
            message: 'Applicant industry tag created successfully',
            data: saved,
        };
    }
    async createMany(
        userId: number,
        dtos: CreateApplicantIndustryTagDto[],
    ) {
        const applicant = await this.getApplicant(userId);

        const tags = dtos.map((dto) =>
            this.tagsRepo.create({
                applicant_id: applicant.id,
                industry_id: dto.industry_id,
                tag_name: dto.tag_name.trim(),
            }),
        );

        const saved = await this.tagsRepo.save(tags);

        return {
            success: true,
            message: 'Applicant industry tags created successfully',
            data: saved,
        };
    }

    async findAll(userId: number) {
        const applicant = await this.getApplicant(userId);

        const tags = await this.tagsRepo.find({
            where: {
                applicant_id: applicant.id,
            },
            order: {
                id: 'DESC',
            },
        });

        return {
            success: true,
            message: 'Applicant industry tags retrieved successfully',
            data: tags,
        };
    }

    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);

        const tag = await this.findOwnedTag(
            id,
            applicant.id,
        );

        return {
            success: true,
            message: 'Applicant industry tag retrieved successfully',
            data: tag,
        };
    }

    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantIndustryTagDto,
    ) {
        const applicant = await this.getApplicant(userId);

        const tag = await this.findOwnedTag(
            id,
            applicant.id,
        );

        if (dto.industry_id !== undefined) {
            tag.industry_id = dto.industry_id;
        }

        if (dto.tag_name !== undefined) {
            tag.tag_name = dto.tag_name.trim();
        }

        tag.updated_at = new Date();

        const saved = await this.tagsRepo.save(tag);

        return {
            success: true,
            message: 'Applicant industry tag updated successfully',
            data: saved,
        };
    }

    async remove(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);

        const tag = await this.findOwnedTag(
            id,
            applicant.id,
        );

        await this.tagsRepo.remove(tag);

        return {
            success: true,
            message: 'Applicant industry tag deleted successfully',
            data: {
                id,
            },
        };
    }
}