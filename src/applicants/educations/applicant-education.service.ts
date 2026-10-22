
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DataSource,
    EntityManager,
    IsNull,
    Repository,
} from 'typeorm';

import { ApplicantEducation } from 'src/entities/applicants/applicant-education.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Colleges } from 'src/entities/colleges.entity';
import { Courses } from 'src/entities/courses.entity';
import { Majors } from 'src/entities/majors.entity';
import { EducationLevels } from 'src/entities/education-levels.entity';

import { CreateApplicantEducationDto } from './dto/create-applicant-education.dto';
import { UpdateApplicantEducationDto } from './dto/update-applicant-education.dto';

@Injectable()
export class ApplicantEducationService {
    constructor(
        @InjectRepository(ApplicantEducation)
        private readonly educationRepository: Repository<ApplicantEducation>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Colleges)
        private readonly collegesRepository: Repository<Colleges>,

        @InjectRepository(Courses)
        private readonly coursesRepository: Repository<Courses>,

        @InjectRepository(Majors)
        private readonly majorsRepository: Repository<Majors>,

        @InjectRepository(EducationLevels)
        private readonly educationLevelsRepository: Repository<EducationLevels>,

        private readonly dataSource: DataSource,
    ) { }

    // =========================================================
    // GET APPLICANT FROM AUTHENTICATED USER
    // =========================================================

    private async getApplicantByUserId(
        userId: number,
    ): Promise<Applicants> {
        const applicant = await this.applicantsRepository.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile was not found for the authenticated user.',
            );
        }

        return applicant;
    }

    // =========================================================
    // NORMALIZE MIXED ID/NAME INPUTS
    // "15" => ID 15
    // "Software Engineering" => name
    // =========================================================

    private parseRecordId(
        value: number | string | null | undefined,
    ): number | null {
        if (typeof value === 'number') {
            return Number.isSafeInteger(value) && value > 0
                ? value
                : null;
        }

        if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
            const id = Number(value.trim());

            return Number.isSafeInteger(id) && id > 0
                ? id
                : null;
        }

        return null;
    }

    private getTextValue(
        value: number | string | null | undefined,
        fallback?: string,
    ): string | undefined {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }

        return fallback?.trim() || undefined;
    }

    // =========================================================
    // GET EDUCATION LEVEL
    // =========================================================

    private async getEducationLevel(
        id: number,
        manager: EntityManager,
    ): Promise<EducationLevels> {
        const level = await manager
            .getRepository(EducationLevels)
            .findOne({
                where: { id, hide: false },
            });

        if (!level) {
            throw new NotFoundException(
                `Education level with ID ${id} was not found.`,
            );
        }

        return level;
    }

    // =========================================================
    // GET COURSE
    // =========================================================

    private async getCourse(
        id: number,
        manager: EntityManager,
    ): Promise<Courses> {
        const course = await manager.getRepository(Courses).findOne({
            where: { id, hide: false },
        });

        if (!course) {
            throw new NotFoundException(
                `Course with ID ${id} was not found.`,
            );
        }

        return course;
    }

    // =========================================================
    // GET MAJOR
    // =========================================================

    private async getMajor(
        id: number,
        manager: EntityManager,
    ): Promise<Majors> {
        const major = await manager.getRepository(Majors).findOne({
            where: { id },
        });

        if (!major) {
            throw new NotFoundException(
                `Major with ID ${id} was not found.`,
            );
        }

        return major;
    }

    // =========================================================
    // GET COLLEGE
    // =========================================================

    private async getCollege(
        id: number,
        manager: EntityManager,
    ): Promise<Colleges> {
        const college = await manager.getRepository(Colleges).findOne({
            where: { id, hide: false },
        });

        if (!college) {
            throw new NotFoundException(
                `College with ID ${id} was not found.`,
            );
        }

        return college;
    }

    // =========================================================
    // RESOLVE COLLEGE
    // Accepts college_id OR college_name.
    // A non-numeric college_id is treated as a college name.
    // =========================================================
    private async resolveCollege(
        userId: number,
        dto: Partial<CreateApplicantEducationDto>,
        manager: EntityManager,
    ): Promise<Colleges | null> {
        const collegeRepo = manager.getRepository(Colleges);

        const rawId = dto.college_id as
            | number
            | string
            | null
            | undefined;

        // Explicitly allow no college
        if (rawId === null) {
            return null;
        }

        // If an existing numeric ID is supplied, use it
        const collegeId = this.parseRecordId(rawId);

        if (collegeId !== null) {
            return this.getCollege(collegeId, manager);
        }

        // Accept either college_id as a name or college_name
        const collegeName = this.getTextValue(
            rawId,
            dto.college_name,
        );

        if (!collegeName) {
            if (rawId !== undefined || dto.college_name !== undefined) {
                throw new BadRequestException(
                    'Provide a valid college ID or college name.',
                );
            }

            return null;
        }

        // Reuse an existing college with the same name
        const existing = await collegeRepo
            .createQueryBuilder('college')
            .where(
                'LOWER(college.college_name) = LOWER(:name)',
                { name: collegeName },
            )
            .andWhere('college.hide = :hide', { hide: false })
            .getOne();

        if (existing) {
            return existing;
        }

        const college = collegeRepo.create({
            college_name: collegeName,
            region_id: dto.college_region_id,
            creator_id: userId,
            updator_id: userId,
            hide: false,
        });

        return await collegeRepo.save(college);
    }

    // =========================================================
    // RESOLVE COURSE
    // Accepts course_id OR course_name.
    // =========================================================


private async resolveCourse(
    userId: number,
    dto: Partial<CreateApplicantEducationDto>,
    educationLevelId: number,
    manager: EntityManager,
): Promise<Courses> {
    const courseRepo = manager.getRepository(Courses);

    const rawId = dto.course_id as
        | number
        | string
        | null
        | undefined;

    // Normalize missing or zero IDs to 0.
    const rawEducationLevelId = Number(educationLevelId) || 0;
    const rawProgrammeCategoryId =
        Number(dto.programme_category_id) || 0;

    if (rawId === null) {
        throw new BadRequestException(
            'Provide course_id or course_name.',
        );
    }

    const courseId = this.parseRecordId(rawId);

    // Resolve an existing course by ID without checking
    // its education-level or programme-category relationship.
    if (courseId !== null) {
        const course = await this.getCourse(courseId, manager);
        return course;
    }

    const courseName = this.getTextValue(
        rawId,
        dto.course_name,
    );

    if (!courseName) {
        throw new BadRequestException(
            'Provide course_id or course_name.',
        );
    }

    // Search by course name only; do not enforce relationships.
    const existing = await courseRepo
        .createQueryBuilder('course')
        .where('LOWER(course.course_name) = LOWER(:name)', {
            name: courseName,
        })
        .andWhere('course.hide = :hide', { hide: false })
        .getOne();

    if (existing) {
        return existing;
    }

    // Create the course using 0 when either ID is missing.
    const course = courseRepo.create({
        course_name: courseName,
        education_level_id: rawEducationLevelId,
        programme_category_id: rawProgrammeCategoryId,
        creator_id: userId,
        updator_id: userId,
        hide: false,
    });

    return courseRepo.save(course);
}



    // =========================================================
    // RESOLVE MAJOR
    // Accepts major_id OR major_name.
    // =========================================================

    private async resolveMajor(
        userId: number,
        dto: Partial<CreateApplicantEducationDto>,
        manager: EntityManager,
    ): Promise<Majors> {
        const majorRepo = manager.getRepository(Majors);

        const rawId = dto.major_id as number | string | null | undefined;

        if (rawId === null) {
            throw new BadRequestException('Provide major_id or major_name.');
        }

        const majorId = this.parseRecordId(rawId);

        if (majorId !== null) {
            return this.getMajor(majorId, manager);
        }

        const majorName = this.getTextValue(rawId, dto.major_name);

        if (!majorName) {
            throw new BadRequestException('Provide major_id or major_name.');
        }

        const formattedName = majorName
            .toLowerCase()
            .replace(/\b\w/g, (character) => character.toUpperCase());

        const existing = await majorRepo
            .createQueryBuilder('major')
            .where('LOWER(major.name) = LOWER(:name)', {
                name: formattedName,
            })
            .getOne();

        if (existing) {
            return existing;
        }

        const major = majorRepo.create({
            name: formattedName,
            creator_id: userId,
            updator_id: userId,
        });

        return majorRepo.save(major);
    }


    private async findDuplicateEducation(
        manager: EntityManager,
        applicantId: number,
        educationLevelId: number,
        collegeName: string | null,
        courseName: string,
        majorName: string,
        excludeId?: number,
    ): Promise<ApplicantEducation | null> {
        const query = manager
            .getRepository(ApplicantEducation)
            .createQueryBuilder('education')
            .leftJoin('education.college', 'college')
            .innerJoin('education.course', 'course')
            .innerJoin('education.major', 'major')
            .where('education.applicant_id = :applicantId', {
                applicantId,
            })
            .andWhere('education.education_level_id = :educationLevelId', {
                educationLevelId,
            })
            .andWhere(
                'LOWER(TRIM(course.course_name)) = LOWER(TRIM(:courseName))',
                { courseName },
            )
            .andWhere(
                'LOWER(TRIM(major.name)) = LOWER(TRIM(:majorName))',
                { majorName },
            );

        if (collegeName !== null) {
            query.andWhere(
                'LOWER(TRIM(college.college_name)) = LOWER(TRIM(:collegeName))',
                { collegeName },
            );
        } else {
            query.andWhere('education.college_id IS NULL');
        }

        if (excludeId !== undefined) {
            query.andWhere('education.id != :excludeId', { excludeId });
        }

        return query.getOne();
    }
    // =========================================================
    // CREATE EDUCATION
    // =========================================================

    async create(
        userId: number,
        dto: CreateApplicantEducationDto,
    ) {
        const applicant = await this.getApplicantByUserId(userId);

        return this.dataSource.transaction(async (manager) => {
            const educationLevel = await this.getEducationLevel(
                dto.education_level_id,
                manager,
            );

            const college = await this.resolveCollege(
                userId,
                dto,
                manager,
            );

            const course = await this.resolveCourse(
                userId,
                dto,
                educationLevel.id,
                manager,
            );
            const major = await this.resolveMajor(userId, dto, manager);


            const educationRepo = manager.getRepository(ApplicantEducation);

            const duplicate = await this.findDuplicateEducation(
                manager,
                applicant.id,
                educationLevel.id,
                college?.college_name ?? null,
                course.course_name,
                major.name,
            );

            if (duplicate) {
                throw new BadRequestException(
                    'This education record already exists for the applicant.',
                );
            }

            const education = educationRepo.create({
                applicant_id: applicant.id,
                education_level_id: educationLevel.id,
                college_id: college?.id ?? null,
                course_id: course.id,
                major_id: major.id,
                name: dto.name?.trim() || null,
                attachment: dto.attachment?.trim() || null,
                started: dto.started ? new Date(dto.started) : null,
                ended: dto.ended ? new Date(dto.ended) : null,
            });

            const saved = await educationRepo.save(education);

            return this.loadAndFormat(
                manager,
                saved.id,
                applicant.id,
            );
        });
    }

    // =========================================================
    // GET ALL EDUCATION FOR CURRENT APPLICANT
    // =========================================================

    async findAll(userId: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const records = await this.educationRepository.find({
            where: { applicant_id: applicant.id },
            relations: {
                college: true,
                course: true,
                major: true,
                education_level: true,
            },
            order: {
                started: 'DESC',
                id: 'DESC',
            },
        });

        return records.map((record) => this.formatEducation(record));
    }

    // =========================================================
    // GET ONE EDUCATION
    // =========================================================

    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const education = await this.educationRepository.findOne({
            where: {
                id,
                applicant_id: applicant.id,
            },
            relations: {
                college: true,
                course: true,
                major: true,
                education_level: true,
            },
        });

        if (!education) {
            throw new NotFoundException(
                'Education record was not found.',
            );
        }

        return this.formatEducation(education);
    }

    // =========================================================
    // UPDATE EDUCATION
    // Supports ID/name input for college, course and major.
    // =========================================================

    async update(
        userId: number,
        id: number,
        dto: UpdateApplicantEducationDto,
    ) {
        const applicant = await this.getApplicantByUserId(userId);

        return this.dataSource.transaction(async (manager) => {
            const educationRepo = manager.getRepository(ApplicantEducation);

            const education = await educationRepo.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

            if (!education) {
                throw new NotFoundException(
                    'Education record was not found.',
                );
            }

            const educationLevelId =
                dto.education_level_id ?? education.education_level_id;

            await this.getEducationLevel(educationLevelId, manager);

            const hasCollegeInput =
                dto.college_id !== undefined ||
                dto.college_name !== undefined;

            if (hasCollegeInput) {
                const college = await this.resolveCollege(
                    userId,
                    dto,
                    manager,
                );

                education.college_id = college?.id ?? null;
            }

            const hasCourseInput =
                dto.course_id !== undefined ||
                dto.course_name !== undefined;

            if (hasCourseInput) {
                const course = await this.resolveCourse(
                    userId,
                    dto,
                    educationLevelId,
                    manager,
                );

                education.course_id = course.id;
            } else if (dto.education_level_id !== undefined) {
                const currentCourse = await this.getCourse(
                    education.course_id,
                    manager,
                );

                if (
                    currentCourse.education_level_id !== educationLevelId
                ) {
                    throw new BadRequestException(
                        'The existing course does not belong to the updated education level. Provide a matching course ID or course name.',
                    );
                }
            }

            const hasMajorInput =
                dto.major_id !== undefined ||
                dto.major_name !== undefined;

            if (hasMajorInput) {
                const major = await this.resolveMajor(userId, dto, manager);
                education.major_id = major.id;
            }

            education.education_level_id = educationLevelId;

            if (dto.name !== undefined) {
                education.name = dto.name?.trim() || null;
            }

            if (dto.attachment !== undefined) {
                education.attachment =
                    dto.attachment?.trim() || null;
            }

            if (dto.started !== undefined) {
                education.started = dto.started
                    ? new Date(dto.started)
                    : null;
            }

            if (dto.ended !== undefined) {
                education.ended = dto.ended
                    ? new Date(dto.ended)
                    : null;
            }

            const duplicate = await educationRepo.findOne({
                where: {
                    applicant_id: applicant.id,
                    education_level_id: education.education_level_id,
                    course_id: education.course_id,
                    major_id: education.major_id,
                    college_id:
                        education.college_id === null
                            ? IsNull()
                            : education.college_id,
                },
            });

            if (duplicate && duplicate.id !== education.id) {
                throw new BadRequestException(
                    'Another education record with these details already exists.',
                );
            }

            await educationRepo.save(education);

            return this.loadAndFormat(
                manager,
                education.id,
                applicant.id,
            );
        });
    }

    // =========================================================
    // DELETE EDUCATION
    // Only deletes the applicant's education record.
    // Universal records remain unchanged.
    // =========================================================

    async remove(userId: number, id: number) {
        const applicant = await this.getApplicantByUserId(userId);

        const education = await this.educationRepository.findOne({
            where: {
                id,
                applicant_id: applicant.id,
            },
        });

        if (!education) {
            throw new NotFoundException(
                'Education record was not found.',
            );
        }

        await this.educationRepository.remove(education);

        return {
            id,
            message: 'Education record deleted successfully.',
        };
    }

    // =========================================================
    // LOAD EDUCATION WITH RELATIONS
    // =========================================================

    private async loadAndFormat(
        manager: EntityManager,
        educationId: number,
        applicantId: number,
    ) {
        const education = await manager
            .getRepository(ApplicantEducation)
            .findOne({
                where: {
                    id: educationId,
                    applicant_id: applicantId,
                },
                relations: {
                    college: true,
                    course: true,
                    major: true,
                    education_level: true,
                },
            });

        if (!education) {
            throw new NotFoundException(
                'Education record was not found.',
            );
        }

        return this.formatEducation(education);
    }

    // =========================================================
    // FORMAT RESPONSE
    // =========================================================

    private formatEducation(education: ApplicantEducation) {
        return {
            id: education.id,

            education_level: education.education_level
                ? {
                    id: education.education_level.id,
                    name: education.education_level.education_level,
                }
                : null,

            college: education.college
                ? {
                    id: education.college.id,
                    name: education.college.college_name,
                    town: education.college.town,
                    region_id: education.college.region_id,
                }
                : null,

            course: education.course
                ? {
                    id: education.course.id,
                    name: education.course.course_name,
                }
                : null,

            major: education.major
                ? {
                    id: education.major.id,
                    name: education.major.name,
                }
                : null,

            name: education.name,
            attachment: education.attachment,
            started: education.started,
            ended: education.ended,
            created_at: education.created_at,
            updated_at: education.updated_at,
        };
    }
}
