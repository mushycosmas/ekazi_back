import { Injectable, NotFoundException } from '@nestjs/common';
import { Jobs } from '../entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Injectable()
export class JobMatchService {

    constructor(
        @InjectRepository(Jobs)
        private readonly jobRepo: Repository<Jobs>,
        @InjectRepository(Applicants)
        private readonly applicantRepo: Repository<Applicants>,
    ) { }
    async findApplicantsByJob(
        jobId: number,
        page = 1,
        limit = 20,
        search?: string
    ) {

        const MIN_MATCH = 50;
        const MAX_SCORE = 13;

        const job = await this.jobRepo.findOne({
            where: { id: jobId },
            relations: [
                'position',
                'positionLevel',
                'industry',
                'jobEducation',
                'languages',
                'jobTools',
                'jobSoftwares',
                'jobKnowledge',
                'jobMajors',
                'jobPersonalities',
                'jobCultures',
                'jobCourses'
            ]
        });

        if (!job)
            throw new NotFoundException('Job not found');

        const positionId = job.position_id;
        const industryId = job.industry_id;
        const positionLevelId = job.position_level_id;
        const jobYearsExperience = job.years_experience ?? 0;

        const educationIds = job.jobEducation?.map(e => e.education_level_id) || [];
        const languageIds = job.languages?.map(e => e.language_id) || [];
        const toolIds = job.jobTools?.map(e => e.tool_id) || [];
        const softwareIds = job.jobSoftwares?.map(e => e.software_id) || [];
        const knowledgeIds = job.jobKnowledge?.map(e => e.knowledge_id) || [];
        const majorIds = job.jobMajors?.map(e => e.major_id) || [];
        const personalityIds = job.jobPersonalities?.map(e => e.personality_id) || [];
        const cultureIds = job.jobCultures?.map(e => e.culture_id) || [];
        const courseIds = job.jobCourses?.map(e => e.course_id) || [];

        const params = {
            positionId,
            industryId,
            positionLevelId,
            jobYearsExperience,
            educationIds: educationIds.length ? educationIds : [0],
            languageIds: languageIds.length ? languageIds : [0],
            toolIds: toolIds.length ? toolIds : [0],
            softwareIds: softwareIds.length ? softwareIds : [0],
            knowledgeIds: knowledgeIds.length ? knowledgeIds : [0],
            majorIds: majorIds.length ? majorIds : [0],
            personalityIds: personalityIds.length ? personalityIds : [0],
            cultureIds: cultureIds.length ? cultureIds : [0],
            courseIds: courseIds.length ? courseIds : [0]
        };


        const positionScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_positions ap
            WHERE ap.applicant_id = applicant.id AND ap.position_id = :positionId
        ) THEN 1 ELSE 0 END
    `;
        const positionLevelScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_positions ap
            WHERE ap.applicant_id = applicant.id AND ap.position_level_id = :positionLevelId
        ) THEN 1 ELSE 0 END
    `;
        const industryScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_positions ap
            WHERE ap.applicant_id = applicant.id AND ap.industry_id = :industryId
        ) THEN 1 ELSE 0 END
    `;
        const educationScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_education ed
            WHERE ed.applicant_id = applicant.id AND ed.education_level_id IN (:...educationIds)
        ) THEN 1 ELSE 0 END
    `;
        const majorScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_education ed
            WHERE ed.applicant_id = applicant.id AND ed.major_id IN (:...majorIds)
        ) THEN 1 ELSE 0 END
    `;
        const courseScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_education ed
            WHERE ed.applicant_id = applicant.id AND ed.course_id IN (:...courseIds)
        ) THEN 1 ELSE 0 END
    `;
        const languageScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_languages al
            WHERE al.applicant_id = applicant.id AND al.language_id IN (:...languageIds)
        ) THEN 1 ELSE 0 END
    `;
        const toolScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_tools at
            WHERE at.applicant_id = applicant.id AND at.tool_id IN (:...toolIds)
        ) THEN 1 ELSE 0 END
    `;
        const softwareScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_software asw
            WHERE asw.applicant_id = applicant.id AND asw.software_id IN (:...softwareIds)
        ) THEN 1 ELSE 0 END
    `;
        const knowledgeScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_knowledge ak
            WHERE ak.applicant_id = applicant.id AND ak.knowledge_id IN (:...knowledgeIds)
        ) THEN 1 ELSE 0 END
    `;
        const personalityScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_personalities ap2
            WHERE ap2.applicant_id = applicant.id AND ap2.personality_id IN (:...personalityIds)
        ) THEN 1 ELSE 0 END
    `;
        const cultureScoreExpr = `
        CASE WHEN EXISTS (
            SELECT 1 FROM applicant_cultures ac
            WHERE ac.applicant_id = applicant.id AND ac.culture_id IN (:...cultureIds)
        ) THEN 1 ELSE 0 END
    `;

        // --- Experience years ---
        // Sums each position's duration in months (end_date, or NOW() if
        // still current), converts to decimal years. Same logic as the JS
        // calculateExperienceYears() we discussed, done as a correlated
        // subquery so no extra round trip per applicant.
        // NOTE: written for MySQL/MariaDB (TIMESTAMPDIFF, NOW()). If you're
        // on Postgres, tell me and I'll swap to AGE()/EXTRACT().
        const experienceYearsExpr = `(
        SELECT COALESCE(SUM(
            TIMESTAMPDIFF(MONTH, ep.start_date, COALESCE(ep.end_date, NOW()))
        ), 0) / 12.0
        FROM applicant_positions ep
        WHERE ep.applicant_id = applicant.id
        AND ep.start_date IS NOT NULL
        AND (ep.end_date IS NULL OR ep.end_date >= ep.start_date)
    )`;

        // Full 15 points if applicant meets/exceeds required years.
        // Otherwise partial credit proportional to how close they are
        // (e.g. 2.67 / 3 years required -> ~13/15), never negative.
        const experienceScoreExpr = `
            CASE
                WHEN :jobYearsExperience IS NULL OR :jobYearsExperience <= 0 
                    THEN 1

                WHEN ${experienceYearsExpr} >= :jobYearsExperience 
                    THEN 1

                ELSE 0
            END
        `;

        const currentPositionExpr = `(
        SELECT pos.position_name
        FROM applicant_positions curAp
        INNER JOIN positions pos ON pos.id = curAp.position_id
        WHERE curAp.applicant_id = applicant.id
        ORDER BY curAp.start_date DESC
        LIMIT 1
    )`;

        const totalScoreExpr = `(
        ${positionScoreExpr} +
        ${positionLevelScoreExpr} +
        ${industryScoreExpr} +
        ${educationScoreExpr} +
        ${majorScoreExpr} +
        ${knowledgeScoreExpr} +
        ${courseScoreExpr} +
        ${personalityScoreExpr} +
        ${cultureScoreExpr} +
        ${languageScoreExpr} +
        ${toolScoreExpr} +
        ${softwareScoreExpr} +
        ${experienceScoreExpr}
    )`;

        const percentageExpr = `ROUND((${totalScoreExpr} * 100.0) / ${MAX_SCORE})`;

        const buildBaseQuery = () => {
            const qb = this.applicantRepo
                .createQueryBuilder('applicant')

                //     .where(`
                //     EXISTS (SELECT 1 FROM applicant_positions ap WHERE ap.applicant_id = applicant.id AND (ap.position_id = :positionId OR ap.industry_id = :industryId OR ap.position_level_id = :positionLevelId))
                //     OR EXISTS (SELECT 1 FROM applicant_education ed WHERE ed.applicant_id = applicant.id AND (ed.education_level_id IN (:...educationIds) OR ed.major_id IN (:...majorIds) OR ed.course_id IN (:...courseIds)))
                //     OR EXISTS (SELECT 1 FROM applicant_languages al WHERE al.applicant_id = applicant.id AND al.language_id IN (:...languageIds))
                //     OR EXISTS (SELECT 1 FROM applicant_tools at WHERE at.applicant_id = applicant.id AND at.tool_id IN (:...toolIds))
                //     OR EXISTS (SELECT 1 FROM applicant_software asw WHERE asw.applicant_id = applicant.id AND asw.software_id IN (:...softwareIds))
                //     OR EXISTS (SELECT 1 FROM applicant_knowledge ak WHERE ak.applicant_id = applicant.id AND ak.knowledge_id IN (:...knowledgeIds))
                //     OR EXISTS (SELECT 1 FROM applicant_personalities ap2 WHERE ap2.applicant_id = applicant.id AND ap2.personality_id IN (:...personalityIds))
                //     OR EXISTS (SELECT 1 FROM applicant_cultures ac WHERE ac.applicant_id = applicant.id AND ac.culture_id IN (:...cultureIds))
                //     OR ${experienceYearsExpr} > 0
                // `)
                .where(`
                EXISTS (SELECT 1 
                    FROM applicant_positions ap 
                    WHERE ap.applicant_id = applicant.id 
                    AND (
                        ap.position_id = :positionId
                        OR ap.industry_id = :industryId
                        OR ap.position_level_id = :positionLevelId
                    )
                )

                OR EXISTS (
                    SELECT 1 
                    FROM applicant_education ed 
                    WHERE ed.applicant_id = applicant.id 
                    AND (
                        ed.education_level_id IN (:...educationIds)
                        OR ed.major_id IN (:...majorIds)
                        OR ed.course_id IN (:...courseIds)
                    )
                )

                OR EXISTS (
                    SELECT 1
                    FROM applicant_languages al
                    WHERE al.applicant_id = applicant.id
                    AND al.language_id IN (:...languageIds)
                )

                OR EXISTS (
                    SELECT 1
                    FROM applicant_tools at
                    WHERE at.applicant_id = applicant.id
                    AND at.tool_id IN (:...toolIds)
                )

                OR EXISTS (
                    SELECT 1
                    FROM applicant_knowledge ak
                    WHERE ak.applicant_id = applicant.id
                    AND ak.knowledge_id IN (:...knowledgeIds)
                )
            `)


                .setParameters(params)

                .andWhere(`${percentageExpr} >= :minMatch`)
                .setParameter('minMatch', MIN_MATCH);
                  if (search?.trim()) {
                    qb.andWhere(
                        `(
                            applicant.first_name LIKE :search
                            OR applicant.middle_name LIKE :search
                            OR applicant.last_name LIKE :search
                        )`,
                        {
                            search: `%${search.trim()}%`,
                        },
                    );
                }

            return qb;
        };

        const countRaw = await buildBaseQuery()
            .select('applicant.id', 'id')
            .getRawMany();
        const total = countRaw.length;
        const totalPages = Math.ceil(total / limit) || 0;

        const qb = buildBaseQuery()
            .select([
                'applicant.id',
                'applicant.first_name',
                'applicant.middle_name',
                'applicant.last_name',
                'applicant.picture',
                'applicant.created_at'
            ])
            .addSelect(positionScoreExpr, 'position_score')
            .addSelect(positionLevelScoreExpr, 'position_level_score')
            .addSelect(industryScoreExpr, 'industry_score')
            .addSelect(educationScoreExpr, 'education_score')
            .addSelect(majorScoreExpr, 'major_score')
            .addSelect(knowledgeScoreExpr, 'knowledge_score')
            .addSelect(courseScoreExpr, 'course_score')
            .addSelect(personalityScoreExpr, 'personality_score')
            .addSelect(cultureScoreExpr, 'culture_score')
            .addSelect(languageScoreExpr, 'language_score')
            .addSelect(toolScoreExpr, 'tool_score')
            .addSelect(softwareScoreExpr, 'software_score')
            .addSelect(experienceScoreExpr, 'experience_score')
            .addSelect(experienceYearsExpr, 'experience_years')
            .addSelect(totalScoreExpr, 'total_score')
            .addSelect(currentPositionExpr, 'current_position')
            .orderBy('total_score', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const result = await qb.getRawAndEntities();

        const data = result.entities.map((applicant, index) => {

            const raw = result.raw[index];

            const scores = {
                position: Number(raw.position_score),
                position_level: Number(raw.position_level_score),
                industry: Number(raw.industry_score),
                education: Number(raw.education_score),
                majors: Number(raw.major_score),
                knowledge: Number(raw.knowledge_score),
                courses: Number(raw.course_score),
                personalities: Number(raw.personality_score),
                cultures: Number(raw.culture_score),
                languages: Number(raw.language_score),
                tools: Number(raw.tool_score),
                software: Number(raw.software_score),
                experience: Number(raw.experience_score)
            };

            const totalScore = Number(raw.total_score);
            const percentage = Math.round((totalScore / MAX_SCORE) * 100);
            const experienceYears = Math.round(Number(raw.experience_years) * 100) / 100;

            return {

                applicant_id: applicant.id,

                full_name: [
                    applicant.first_name,
                    applicant.middle_name,
                    applicant.last_name
                ]
                    .filter(Boolean)
                    .join(' '),

                picture: applicant.picture,

                current_position: raw.current_position ?? null,

                experience_years: experienceYears,

                match_percentage: percentage,

                match_details: {
                    position: { matched: scores.position > 0, score: scores.position },
                    position_level: { matched: scores.position_level > 0, score: scores.position_level },
                    industry: { matched: scores.industry > 0, score: scores.industry },
                    education: { matched: scores.education > 0, score: scores.education },
                    majors: { matched: scores.majors > 0, score: scores.majors },
                    knowledge: { matched: scores.knowledge > 0, score: scores.knowledge },
                    courses: { matched: scores.courses > 0, score: scores.courses },
                    personalities: { matched: scores.personalities > 0, score: scores.personalities },
                    cultures: { matched: scores.cultures > 0, score: scores.cultures },
                    languages: { matched: scores.languages > 0, score: scores.languages },
                    tools: { matched: scores.tools > 0, score: scores.tools },
                    software: { matched: scores.software > 0, score: scores.software },
                    experience: {
                        matched: scores.experience === 1,
                        score: scores.experience,
                        applicant_years: experienceYears,
                        required_years: jobYearsExperience
                    }
                },

                created_at: applicant.created_at
            };
        });

        return {

            success: true,

            job: {
                id: job.id,
                position: job.position.position_name,
                years_experience: jobYearsExperience
            },

            data,

            pagination: {
                page,
                limit,
                total,
                totalPages
            }

        };
    }


    async findJobsByApplicant(
        applicantId: number,
        page = 1,
        limit = 20
    ) {

        const applicant = await this.applicantRepo.findOne({
            where: {
                id: applicantId
            },
            relations: [
                'positions',
                'applicant_education'
            ]
        });


        if (!applicant) {
            throw new NotFoundException(
                'Applicant not found'
            );
        }


        const positionIds =
            applicant.positions.map(
                p => p.position_id
            );


        const industryIds =
            applicant.positions
                .map(
                    p => p.industry_id
                )
                .filter(Boolean);



        const educationIds =
            applicant.applicant_education
                .map(
                    e => e.education_level_id
                );



        const qb =
            this.jobRepo
                .createQueryBuilder('job')


                .leftJoinAndSelect(
                    'job.position',
                    'position'
                )

                .leftJoinAndSelect(
                    'job.industry',
                    'industry'
                )

                .leftJoinAndSelect(
                    'job.positionLevel',
                    'positionLevel'
                )


                .leftJoin(
                    'job.jobEducation',
                    'education'
                )


                .where(
                    'job.published = :published',
                    {
                        published: '1'
                    }
                )

                .andWhere(
                    'job.hide = false'
                )



                .andWhere(
                    `
(
job.position_id IN (:...positionIds)

OR

job.industry_id IN (:...industryIds)

OR

education.education_level_id IN (:...educationIds)

)
`,
                    {
                        positionIds:
                            positionIds.length ? positionIds : [0],

                        industryIds:
                            industryIds.length ? industryIds : [0],

                        educationIds:
                            educationIds.length ? educationIds : [0]
                    }

                );



        const [jobs, total] =
            await qb

                .orderBy(
                    'job.created_at',
                    'DESC'
                )

                .skip(
                    (page - 1) * limit
                )

                .take(limit)

                .getManyAndCount();



        return {

            success: true,

            data: jobs.map(job => ({

                job_id: job.id,

                title: job.title,

                position:
                    job.position?.position_name,

                industry:
                    job.industry?.industry_name,

                position_level:
                    job.positionLevel?.position_name,


            })),

            pagination: {
                total,
                page,
                limit,
                totalPages:
                    Math.ceil(total / limit)
            }

        };


    }
}
