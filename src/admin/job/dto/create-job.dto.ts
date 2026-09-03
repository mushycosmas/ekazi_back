import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MyJobsQuery {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    industryId?: number;

    @IsOptional()
    @IsIn(['active', 'expired', 'today', 'all'])
    status?: 'active' | 'expired' | 'today' | 'all';

    @IsOptional()
    @IsIn(['published', 'unpublished', 'all'])
    published?: 'published' | 'unpublished' | 'all';
}