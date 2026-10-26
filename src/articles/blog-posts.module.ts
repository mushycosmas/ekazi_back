 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogPost } from 'src/entities/blog-post.entity';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsController } from './blog-posts.controller';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BlogPost,
            Users,
            PersonalAccessToken,
        ]),
    ],
    controllers: [BlogPostsController],
    providers: [BlogPostsService],
    exports: [BlogPostsService],
})
export class BlogPostsModule {}