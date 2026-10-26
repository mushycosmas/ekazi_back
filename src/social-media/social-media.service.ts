 import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Like } from 'typeorm';

import { SocialMedia } from 'src/entities/social-media.entity';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediaService {
    constructor(
        @InjectRepository(SocialMedia)
        private readonly socialMediaRepository: Repository<SocialMedia>,
    ) {}

    async create(dto: CreateSocialMediaDto) {
        const mediaName = dto.media_name.trim();

        const existing = await this.socialMediaRepository.findOne({
            where: { media_name: mediaName },
        });

        if (existing) {
            throw new ConflictException(
                'This social media already exists.',
            );
        }

        const socialMedia = this.socialMediaRepository.create({
            media_name: mediaName,
        });

        const saved = await this.socialMediaRepository.save(socialMedia);

        return {
            success: true,
            message: 'Social media created successfully.',
            data: saved,
        };
    }

    async findAll(page = 1, perPage = 10, search?: string) {
        const currentPage = Math.max(1, Number(page) || 1);
        const limit = Math.min(100, Math.max(1, Number(perPage) || 10));

        const where = search?.trim()
            ? { media_name: Like(`%${search.trim()}%`) }
            : {};

        const [data, total] =
            await this.socialMediaRepository.findAndCount({
                where,
                order: {
                    id: 'DESC',
                },
                skip: (currentPage - 1) * limit,
                take: limit,
            });

        return {
            success: true,
            message: 'Social media records retrieved successfully.',
            data,
            pagination: {
                total,
                page: currentPage,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const socialMedia = await this.socialMediaRepository.findOne({
            where: { id },
        });

        if (!socialMedia) {
            throw new NotFoundException('Social media record not found.');
        }

        return {
            success: true,
            message: 'Social media retrieved successfully.',
            data: socialMedia,
        };
    }

    async update(id: number, dto: UpdateSocialMediaDto) {
        const socialMedia = await this.socialMediaRepository.findOne({
            where: { id },
        });

        if (!socialMedia) {
            throw new NotFoundException('Social media record not found.');
        }

        if (dto.media_name !== undefined) {
            const mediaName = dto.media_name.trim();

            const existing = await this.socialMediaRepository.findOne({
                where: { media_name: mediaName },
            });

            if (existing && existing.id !== id) {
                throw new ConflictException(
                    'This social media name already exists.',
                );
            }

            socialMedia.media_name = mediaName;
        }

        const updated =
            await this.socialMediaRepository.save(socialMedia);

        return {
            success: true,
            message: 'Social media updated successfully.',
            data: updated,
        };
    }

    async remove(id: number) {
        const socialMedia = await this.socialMediaRepository.findOne({
            where: { id },
        });

        if (!socialMedia) {
            throw new NotFoundException('Social media record not found.');
        }

        await this.socialMediaRepository.remove(socialMedia);

        return {
            success: true,
            message: 'Social media deleted successfully.',
        };
    }
}