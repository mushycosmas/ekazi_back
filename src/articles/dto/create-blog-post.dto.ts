import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { BlogPostStatus } from 'src/entities/blog-post.entity';

export class CreateBlogPostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    // Optional: generated from title if omitted
    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @IsOptional()
    @IsString()
    excerpt?: string | null;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    featured_image?: string | null;

    @IsOptional()
    @IsEnum(BlogPostStatus)
    status?: BlogPostStatus;

    @IsOptional()
    @IsDateString()
    published_at?: string | null;

    // Prefer deriving author_id from the authenticated user
    // rather than accepting it from an untrusted client.
    @IsOptional()
    @IsInt()
    @Min(1)
    author_id?: number;
}