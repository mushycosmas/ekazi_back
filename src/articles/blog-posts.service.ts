 import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

 
import {  BlogPost,
    BlogPostStatus } from 'src/entities/blog-post.entity';

import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogPostsService {
    constructor(
        @InjectRepository(BlogPost)
        private readonly blogPostRepository: Repository<BlogPost>,
    ) {}

    private generateSlug(value: string): string {
        return value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    private async ensureSlugAvailable(
        slug: string,
        excludeId?: string,
    ): Promise<void> {
        const existing = await this.blogPostRepository.findOne({
            where: { slug },
        });

        if (existing && String(existing.id) !== excludeId) {
            throw new ConflictException(
                'A blog post with this slug already exists.',
            );
        }
    }

    async create(dto: CreateBlogPostDto, authenticatedAuthorId?: number) {
        const title = dto.title.trim();
        const slug = this.generateSlug(dto.slug?.trim() || title);

        if (!slug) {
            throw new BadRequestException(
                'A valid title or slug is required.',
            );
        }

        await this.ensureSlugAvailable(slug);

        const authorId = authenticatedAuthorId ?? dto.author_id;

        if (!authorId) {
            throw new BadRequestException(
                'author_id is required when no authenticated author is provided.',
            );
        }

        const status = dto.status ?? BlogPostStatus.DRAFT;

        const post = this.blogPostRepository.create({
            title,
            slug,
            excerpt: dto.excerpt ?? null,
            content: dto.content,
            featured_image: dto.featured_image ?? null,
            status,
            published_at:
                dto.published_at !== undefined
                    ? dto.published_at
                        ? new Date(dto.published_at)
                        : null
                    : status === BlogPostStatus.PUBLISHED
                      ? new Date()
                      : null,
            author_id: String(authorId),
            views: '0',
        });

        try {
            const saved = await this.blogPostRepository.save(post);

            return {
                success: true,
                message: 'Blog post created successfully.',
                data: saved,
            };
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                (error as any).driverError?.code === 'ER_DUP_ENTRY'
            ) {
                throw new ConflictException('The slug already exists.');
            }

            throw error;
        }
    }

    async findAll(page = 1, perPage = 10, search?: string, status?: BlogPostStatus) {
        const currentPage = Math.max(1, Number(page) || 1);
        const limit = Math.min(100, Math.max(1, Number(perPage) || 10));

        const query = this.blogPostRepository.createQueryBuilder('post');

        if (search?.trim()) {
            query.andWhere(
                '(post.title LIKE :search OR post.excerpt LIKE :search OR post.content LIKE :search)',
                { search: `%${search.trim()}%` },
            );
        }

        if (status) {
            query.andWhere('post.status = :status', { status });
        }

        const [posts, total] = await query
            .orderBy('post.created_at', 'DESC')
            .addOrderBy('post.id', 'DESC')
            .skip((currentPage - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            success: true,
            message: 'Blog posts retrieved successfully.',
            data: posts,
            pagination: {
                total,
                page: currentPage,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const post = await this.blogPostRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Blog post not found.');
        }

        return {
            success: true,
            message: 'Blog post retrieved successfully.',
            data: post,
        };
    }

    async findBySlug(slug: string) {
        const post = await this.blogPostRepository.findOne({
            where: { slug },
        });

        if (!post) {
            throw new NotFoundException('Blog post not found.');
        }

        return {
            success: true,
            message: 'Blog post retrieved successfully.',
            data: post,
        };
    }

    async update(id: string, dto: UpdateBlogPostDto) {
        const post = await this.blogPostRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Blog post not found.');
        }

        if (dto.slug !== undefined || dto.title !== undefined) {
            const newSlug = this.generateSlug(
                dto.slug?.trim() || dto.title?.trim() || post.slug,
            );

            if (!newSlug) {
                throw new BadRequestException('A valid slug is required.');
            }

            await this.ensureSlugAvailable(newSlug, String(post.id));
            post.slug = newSlug;
        }

        if (dto.title !== undefined) post.title = dto.title.trim();
        if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
        if (dto.content !== undefined) post.content = dto.content;
        if (dto.featured_image !== undefined) {
            post.featured_image = dto.featured_image;
        }
        if (dto.status !== undefined) post.status = dto.status;
        if (dto.published_at !== undefined) {
            post.published_at = dto.published_at
                ? new Date(dto.published_at)
                : null;
        } else if (
            dto.status === BlogPostStatus.PUBLISHED &&
            !post.published_at
        ) {
            post.published_at = new Date();
        }
        if (dto.author_id !== undefined) {
            post.author_id = String(dto.author_id);
        }

        const updated = await this.blogPostRepository.save(post);

        return {
            success: true,
            message: 'Blog post updated successfully.',
            data: updated,
        };
    }

    async remove(id: string) {
        const post = await this.blogPostRepository.findOne({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Blog post not found.');
        }

        await this.blogPostRepository.remove(post);

        return {
            success: true,
            message: 'Blog post deleted successfully.',
        };
    }

    async incrementViews(id: string) {
        const result = await this.blogPostRepository.increment(
            { id },
            'views',
            1,
        );

        if (!result.affected) {
            throw new NotFoundException('Blog post not found.');
        }

        return {
            success: true,
            message: 'Blog post view count updated.',
        };
    }
}