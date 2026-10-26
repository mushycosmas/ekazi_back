import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { BlogPostStatus } from 'src/entities/blog-post.entity';

export class UpdateBlogPostDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @IsOptional()
    @IsString()
    excerpt?: string | null;

    @IsOptional()
    @IsString()
    content?: string;

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

    @IsOptional()
    @IsInt()
    @Min(1)
    author_id?: number;
}