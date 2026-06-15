import { Injectable } from '@nestjs/common';
import { Courses } from 'src/entities/courses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CoursesService {
      constructor(
    @InjectRepository(Courses)
    private readonly courseRepository: Repository<Courses>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.courseRepository
        .createQueryBuilder('course')
        .select([
          'course.id',
          'course.course_name',
        ])
        .orderBy('course.id', 'DESC');

      if (search) {
        query.where(
          'course.course_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.courseRepository.createQueryBuilder('course');

      if (search) {
        totalQuery.where(
          'course.course_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.course_name,
      }));

      return {
        success: true,
        message: 'Courses fetched successfully',
        data: formatted,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message,
      });
    }
  }
}
