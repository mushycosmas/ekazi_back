import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    ParseIntPipe,
    Body,
    Req,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import * as path from 'path';

import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

import { multerConfig } from 'src/common/upload/multer.config';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller()
export class BlogPostsController {
    constructor(
        private readonly blogPostsService: BlogPostsService,
    ) {}

    private getRelativeFilePath(filePath: string): string {
        return path
            .relative(process.cwd(), filePath)
            .split(path.sep)
            .join('/');
    }

    private async removeUploadedFile(
        file?: Express.Multer.File,
    ) {
        if (!file?.path) return;

        try {
            await unlink(file.path);
        } catch (error) {
            console.error(
                'Failed to clean up uploaded blog image:',
                error,
            );
        }
    }

    // GET /api/blog-posts?page=1&per_page=10
    @Get('blog-posts')
    findAll(
        @Query('page') page = '1',
        @Query('per_page') perPage = '10',
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        return this.blogPostsService.findAll(
            Number(page),
            Number(perPage),
            search,
            status as any,
        );
    }

    // POST /api/blog-posts
    @Post('blog-posts')
    @UseGuards(SanctumGuard)
    @UseInterceptors(
        FileInterceptor(
            'featured_image',
            multerConfig('blog'),
        ),
    )
    async create(
        @Req() req: any,
        @Body() dto: CreateBlogPostDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            dto.featured_image = this.getRelativeFilePath(
                file.path,
            );
        }

        try {
            // Use the authenticated user as the blog author.
            return await this.blogPostsService.create(
                dto,
                req.user.id,
            );
        } catch (error) {
            await this.removeUploadedFile(file);
            throw error;
        }
    }

    // GET /api/blog-posts/slug/:slug
    @Get('blog-posts/slug/:slug')
    findBySlug(
        @Param('slug') slug: string,
    ) {
        return this.blogPostsService.findBySlug(slug);
    }

    // GET /api/blog-posts/:id
    @Get('blog-posts/:id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.blogPostsService.findOne(String(id));
    }

    // PATCH /api/blog-posts/:id
    @Patch('blog-posts/:id')
    @UseGuards(SanctumGuard)
    @UseInterceptors(
        FileInterceptor(
            'featured_image',
            multerConfig('blog'),
        ),
    )
    async update(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBlogPostDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            dto.featured_image = this.getRelativeFilePath(
                file.path,
            );
        }

        try {
            return await this.blogPostsService.update(
                String(id),
                dto,
            );
        } catch (error) {
            await this.removeUploadedFile(file);
            throw error;
        }
    }

    // POST /api/blog-posts/:id/views
    @Post('blog-posts/:id/views')
    incrementViews(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.blogPostsService.incrementViews(
            String(id),
        );
    }

    // DELETE /api/blog-posts/:id
    @Delete('blog-posts/:id')
    @UseGuards(SanctumGuard)
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.blogPostsService.remove(String(id));
    }
}