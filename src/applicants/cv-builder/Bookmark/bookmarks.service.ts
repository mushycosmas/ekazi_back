 import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bookmark } from 'src/entities/bookmark.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { BookmarkDto } from './dto/bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,

    @InjectRepository(Applicants)
    private readonly applicantsRepository: Repository<Applicants>,
  ) {}

  private async getApplicantId(userId: number): Promise<number> {
    const applicant = await this.applicantsRepository.findOne({
      select: { id: true },
      where: { user_id: userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return applicant.id;
  }

  // Add bookmark or toggle status
  async store(userId: number, dto: BookmarkDto) {
    const applicantId = await this.getApplicantId(userId);

    let bookmark = await this.bookmarkRepository.findOne({
      where: {
        applicant_id: applicantId,
        template_id: dto.template_id,
      },
    });

    let message: string;

    if (bookmark) {
      bookmark.status = !bookmark.status;
      await this.bookmarkRepository.save(bookmark);

      message = bookmark.status
        ? 'Bookmarked successfully'
        : 'Bookmark removed';
    } else {
      bookmark = this.bookmarkRepository.create({
        applicant_id: applicantId,
        template_id: dto.template_id,
        status: true,
      });

      await this.bookmarkRepository.save(bookmark);
      message = 'Bookmarked successfully';
    }

    return { message, data: bookmark };
  }

  // Remove bookmark
  async destroy(userId: number, dto: BookmarkDto) {
    const applicantId = await this.getApplicantId(userId);

    await this.bookmarkRepository.delete({
      applicant_id: applicantId,
      template_id: dto.template_id,
    });

    return { message: 'Bookmark removed' };
  }

  // Get current applicant's bookmarks
  async index(userId: number) {
    const applicantId = await this.getApplicantId(userId);

    return this.bookmarkRepository.find({
      where: { applicant_id: applicantId },
      order: { created_at: 'DESC' },
    });
  }

  // Check current applicant's bookmark
  async check(userId: number, dto: BookmarkDto) {
    const applicantId = await this.getApplicantId(userId);

    const exists = await this.bookmarkRepository.exists({
      where: {
        applicant_id: applicantId,
        template_id: dto.template_id,
        status: true,
      },
    });

    return { is_bookmarked: exists };
  }
}