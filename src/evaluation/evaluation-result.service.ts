import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SaveEvaluationResultDto } from './dto/save-evaluation-result.dto';
import { PreparedBulkInterviewDto } from './dto/bulk-prepared-interview.dto';
import { PanelCommentDto } from './dto/panel-comment.dto';
import { PreparedInterviewDto } from './dto/prepared-interview.dto';

import { Evaluation } from 'src/entities/evaluation.entity';
import { EvaluationForm } from 'src/entities/evaluation-form.entity';
import { EvaluationRemark } from 'src/entities/evaluation-remark.entity';
import { Remark } from 'src/entities/remark.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { EvaluationSummary } from 'src/entities/evaluation-summary.entity';
import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';
import { EvaluationCriteria } from 'src/entities/evaluation-criteria.entity';
import { CreateEvaluationInterviewDto } from './dto/create-evaluation-interview.dto';
import { EvaluationResult } from 'src/entities/evaluation-result.entity';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class EvaluationResultService {
    constructor(
        @InjectRepository(Evaluation)
        private readonly evaluationRepository:
            Repository<Evaluation>,

        @InjectRepository(EvaluationResult)
        private readonly evaluationresultRepository:
            Repository<EvaluationResult>,

        @InjectRepository(EvaluationCriteria)
        private readonly evaluationCreteriaRepository:
            Repository<EvaluationCriteria>,

        @InjectRepository(EvaluationRemark)
        private readonly evaluationRemarkRepository:
            Repository<EvaluationRemark>,

        @InjectRepository(Remark)
        private readonly remarkRepository:
            Repository<Remark>,

        @InjectRepository(Benefit)
        private readonly benefitRepository:
            Repository<Benefit>,

        @InjectRepository(EvaluationSummary)
        private readonly evaluationSummaryRepository:
            Repository<EvaluationSummary>,

        @InjectRepository(InterviewAction)
        private readonly interviewActionRepository:
            Repository<InterviewAction>,

        private readonly dataSource: DataSource,
    ) { }


    async create(
        userId: number,
        dto: CreateEvaluationInterviewDto,
    ) {
        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const results = dto.evaluations.map((evaluation) =>
                queryRunner.manager.create(EvaluationResult, {
                    evaluation_id: evaluation.evaluation_id,

                    applicant_id: dto.applicant_id,
                    job_id: dto.job_id,

                    evaluator_id: userId,

                    score: evaluation.total_score,

                    comment: dto.comment ?? '',

                    creator_id: userId,
                    updator_id: userId,
                }),
            );

            const saved = await queryRunner.manager.save(
                EvaluationResult,
                results,
            );

            await queryRunner.commitTransaction();

            // Calculate overall percentage
            const totalPercentage =
                dto.evaluations.reduce(
                    (total, evaluation) =>
                        total + Number(evaluation.total_score),
                    0,
                );

            const totalEvaluations =
                dto.evaluations.length;

            const overallPercentage =
                totalEvaluations > 0
                    ? Number(
                        (
                            totalPercentage /
                            totalEvaluations
                        ).toFixed(2),
                    )
                    : 0;

            return {
                status: true,
                message:
                    'Interview evaluation saved successfully',

                data: {
                    applicant_id: dto.applicant_id,
                    job_id: dto.job_id,
                    evaluator_id: userId,

                    evaluations: saved,

                    total_evaluations: totalEvaluations,

                    total_percentage: overallPercentage,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async getEvaluatorResults(
        applicantId: number,
        jobId: number,
    ) {
        const results = await this.evaluationresultRepository
            .createQueryBuilder('result')
            .select('result.evaluator_id', 'evaluator_id')
            .addSelect(
                'ROUND(AVG(result.score), 2)',
                'average_percentage',
            )
            .addSelect(
                'COUNT(result.id)',
                'total_evaluations',
            )
            .where('result.applicant_id = :applicantId', {
                applicantId,
            })
            .andWhere('result.job_id = :jobId', {
                jobId,
            })
            .groupBy('result.evaluator_id')
            .getRawMany();

        if (!results.length) {
            return {
                status: true,
                message: 'No evaluation results found',
                data: {
                    applicant_id: applicantId,
                    job_id: jobId,
                    evaluators: [],
                    total_percentage: 0,
                },
            };
        }

        const evaluators = results.map((item) => ({
            evaluator_id: Number(item.evaluator_id),
            average_percentage: Number(
                item.average_percentage,
            ),
            total_evaluations: Number(
                item.total_evaluations,
            ),
        }));

        // Average of each evaluator's percentage
        const totalPercentage =
            evaluators.reduce(
                (total, evaluator) =>
                    total +
                    evaluator.average_percentage,
                0,
            ) / evaluators.length;

        return {
            status: true,
            message: 'Evaluation results retrieved successfully',
            data: {
                applicant_id: applicantId,
                job_id: jobId,

                evaluators,

                total_evaluators: evaluators.length,

                total_percentage: Number(
                    totalPercentage.toFixed(2),
                ),
            },
        };
    }
async getAllApplicantsReport(jobId: number) {
    const query = this.evaluationresultRepository
        .createQueryBuilder('result')
        .leftJoin(
            Users,
            'user',
            'user.id = result.evaluator_id',
        )
        .leftJoin(
            'applicants',
            'applicant',
            'applicant.id = result.applicant_id',
        )
        .leftJoin(
            'jobs',
            'job',
            'job.id = result.job_id',
        )
        .where('result.job_id = :jobId', {
            jobId,
        })
        .andWhere('result.applicant_id IS NOT NULL');

    const results = await query
        .select([
            'result.id AS result_id',
            'result.evaluation_id AS evaluation_id',
            'result.applicant_id AS applicant_id',
            'result.job_id AS job_id',
            'result.evaluator_id AS evaluator_id',
            'result.score AS score',
            'result.comment AS comment',

            'user.id AS evaluator_user_id',
            'user.name AS evaluator_name',
            'user.email AS evaluator_email',

            'job.id AS job_id',
            'job.title AS job_title',
        ])
        .orderBy('result.applicant_id', 'ASC')
        .addOrderBy('result.evaluator_id', 'ASC')
        .addOrderBy('result.evaluation_id', 'ASC')
        .getRawMany();

    const applicantsMap = new Map<number, any>();

    for (const row of results) {
        const applicantId = Number(row.applicant_id);
        const evaluatorId = Number(row.evaluator_id);
        const score = Number(row.score ?? 0);

        if (!applicantsMap.has(applicantId)) {
            applicantsMap.set(applicantId, {
                applicant_id: applicantId,
                job_id: Number(row.job_id),
                job_title: row.job_title,
                evaluators: new Map<number, any>(),
            });
        }

        const applicant =
            applicantsMap.get(applicantId);

        if (!applicant.evaluators.has(evaluatorId)) {
            applicant.evaluators.set(evaluatorId, {
                evaluator_id: evaluatorId,
                evaluator_name:
                    row.evaluator_name ?? null,
                evaluator_email:
                    row.evaluator_email ?? null,
                evaluations: [],
            });
        }

        const evaluator =
            applicant.evaluators.get(evaluatorId);

        evaluator.evaluations.push({
            result_id: Number(row.result_id),
            evaluation_id: Number(row.evaluation_id),
            score,
            comment: row.comment ?? null,
        });
    }

    const applicants = Array.from(
        applicantsMap.values(),
    ).map((applicant) => {

        const evaluators = Array.from(
            applicant.evaluators.values(),
        ).map((evaluator: any) => {

            const total = evaluator.evaluations.reduce(
                (sum: number, evaluation: any) =>
                    sum + Number(evaluation.score),
                0,
            );

            const totalEvaluations =
                evaluator.evaluations.length;

            const average =
                totalEvaluations > 0
                    ? total / totalEvaluations
                    : 0;

            return {
                evaluator_id:
                    evaluator.evaluator_id,

                evaluator_name:
                    evaluator.evaluator_name,

                evaluator_email:
                    evaluator.evaluator_email,

                total_evaluations:
                    totalEvaluations,

                average_percentage:
                    Number(average.toFixed(2)),

                evaluations:
                    evaluator.evaluations,
            };
        });

        const finalPercentage =
            evaluators.length > 0
                ? evaluators.reduce(
                    (
                        sum: number,
                        evaluator: any,
                    ) =>
                        sum +
                        evaluator.average_percentage,
                    0,
                ) / evaluators.length
                : 0;

        return {
            applicant_id:
                applicant.applicant_id,

            job_id:
                applicant.job_id,

            job_title:
                applicant.job_title,

            total_evaluators:
                evaluators.length,

            evaluators,

            final_percentage:
                Number(finalPercentage.toFixed(2)),
        };
    });

    return {
        status: true,
        message:
            'Job applicant evaluation report generated successfully',
        data: applicants,
    };
}
    /**
     * SAVE COMPLETE EVALUATION
     *
     * Employer + Recruiter
     */
    async store(
        userId: number,
        dto: SaveEvaluationResultDto,
    ) {
        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /**
             * 1. Verify job/applicant relationship
             */
            const application =
                await queryRunner.manager.query(
                    `
                    SELECT id
                    FROM applicant_applications
                    WHERE job_id = ?
                      AND applicant_id = ?
                    LIMIT 1
                    `,
                    [
                        dto.job_id,
                        dto.applicant_id,
                    ],
                );

            if (!application.length) {
                throw new BadRequestException(
                    'Applicant has not applied for this job',
                );
            }

            /**
             * 2. Delete previous evaluation results
             */
            await queryRunner.manager.query(
                `
                DELETE FROM evaluation_results
                WHERE job_id = ?
                  AND applicant_id = ?
                `,
                [
                    dto.job_id,
                    dto.applicant_id,
                ],
            );

            /**
             * 3. Insert evaluation results
             */
            for (
                let index = 0;
                index < dto.evaluation_remark_id.length;
                index++
            ) {
                const evaluationRemarkId =
                    dto.evaluation_remark_id[index];

                const comment =
                    dto.comments?.[index] ?? null;

                await queryRunner.manager.query(
                    `
                    INSERT INTO evaluation_results
                    (
                        job_id,
                        applicant_id,
                        evaluation_remark_id,
                        comment,
                        creator_id,
                        created_at,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                    `,
                    [
                        dto.job_id,
                        dto.applicant_id,
                        evaluationRemarkId,
                        comment,
                        userId,
                    ],
                );
            }

            /**
             * 4. Availability
             */
            let availability: string | number | null = null;

            let availabilityDate: Date | null = null;

            if (dto.availability === 'ASAP') {
                availability = '';

                availabilityDate = new Date();
            } else {
                availability =
                    dto.number_days ?? null;

                if (dto.number_days) {
                    availabilityDate =
                        new Date(
                            Date.now() +
                            dto.number_days *
                            24 *
                            60 *
                            60 *
                            1000,
                        );
                }
            }

            /**
             * 5. Applicant Evaluation
             *
             * NOTE:
             * applicant_evaluations table has
             * evaluation_action_id.
             *
             * It does NOT have interview_action_id.
             */
            const existingEvaluation =
                await queryRunner.manager.query(
                    `
                    SELECT id
                    FROM applicant_evaluations
                    WHERE applicant_id = ?
                      AND job_id = ?
                    LIMIT 1
                    `,
                    [
                        dto.applicant_id,
                        dto.job_id,
                    ],
                );

            let applicantEvaluationId: number;

            if (existingEvaluation.length) {
                /**
                 * UPDATE EXISTING EVALUATION
                 */
                applicantEvaluationId =
                    existingEvaluation[0].id;

                await queryRunner.manager.query(
                    `
                    UPDATE applicant_evaluations
                    SET
                        relevant_experience = ?,
                        salary_expectation = ?,
                        availability = ?,
                        recomandation = ?,
                        availability_date = ?,
                        evaluation_summary_id = ?,
                        evaluation_action_id = ?,
                        updator_id = ?,
                        updated_at = NOW()
                    WHERE id = ?
                    `,
                    [
                        dto.relevant_experience ?? null,
                        dto.salary_expectation ?? null,
                        availability,
                        dto.recomandation ?? null,

                        /**
                         * MySQL column is DATE
                         */
                        availabilityDate
                            ? availabilityDate
                                .toISOString()
                                .slice(0, 10)
                            : null,

                        dto.summary_id ?? null,

                        dto.evaluation_action_id ?? null,

                        userId,

                        applicantEvaluationId,
                    ],
                );
            } else {
                /**
                 * CREATE NEW EVALUATION
                 */
                const result =
                    await queryRunner.manager.query(
                        `
                        INSERT INTO applicant_evaluations
                        (
                            applicant_id,
                            job_id,
                            relevant_experience,
                            salary_expectation,
                            availability,
                            recomandation,
                            availability_date,
                            evaluation_summary_id,
                            evaluation_action_id,
                            creator_id,
                            updator_id,
                            created_at,
                            updated_at
                        )
                        VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            NOW(),
                            NOW()
                        )
                        `,
                        [
                            dto.applicant_id,
                            dto.job_id,

                            dto.relevant_experience ?? null,

                            dto.salary_expectation ?? null,

                            availability,

                            dto.recomandation ?? null,

                            /**
                             * MySQL DATE
                             */
                            availabilityDate
                                ? availabilityDate
                                    .toISOString()
                                    .slice(0, 10)
                                : null,

                            dto.summary_id ?? null,

                            dto.evaluation_action_id ?? null,

                            userId,

                            userId,
                        ],
                    );

                applicantEvaluationId =
                    result.insertId;
            }

            /**
             * 6. Relevant Experience
             */
            if (dto.position_id?.length) {
                for (
                    const positionId of dto.position_id
                ) {
                    if (!positionId) {
                        continue;
                    }

                    const existing =
                        await queryRunner.manager.query(
                            `
                            SELECT id
                            FROM applicant_relevant_experiences
                            WHERE applicant_evaluation_id = ?
                              AND position_id = ?
                            LIMIT 1
                            `,
                            [
                                applicantEvaluationId,
                                positionId,
                            ],
                        );

                    if (!existing.length) {
                        await queryRunner.manager.query(
                            `
                            INSERT INTO applicant_relevant_experiences
                            (
                                applicant_evaluation_id,
                                position_id,
                                created_at,
                                updated_at
                            )
                            VALUES (?, ?, NOW(), NOW())
                            `,
                            [
                                applicantEvaluationId,
                                positionId,
                            ],
                        );
                    }
                }
            }

            /**
             * 7. Delete applicant benefits
             */
            // await queryRunner.manager.query(
            //     `
            //     DELETE FROM applicant_job_benefits
            //     WHERE job_id = ?
            //       AND applicant_id = ?
            //     `,
            //     [
            //         dto.job_id,
            //         dto.applicant_id,
            //     ],
            // );

            /**
             * 8. Save benefits
             */
            if (dto.benefit_id?.length) {
                for (
                    const item of dto.benefit_id
                ) {
                    let benefitId: number;

                    /**
                     * Existing benefit ID
                     */
                    if (
                        !Number.isNaN(
                            Number(item),
                        )
                    ) {
                        benefitId =
                            Number(item);
                    } else {
                        /**
                         * Find benefit by name
                         */
                        const existingBenefit =
                            await queryRunner.manager.query(
                                `
                                SELECT id
                                FROM benefits
                                WHERE name = ?
                                LIMIT 1
                                `,
                                [item],
                            );

                        if (
                            existingBenefit.length
                        ) {
                            benefitId =
                                existingBenefit[0]
                                    .id;
                        } else {
                            /**
                             * Create new benefit
                             */
                            const newBenefit =
                                await queryRunner.manager.query(
                                    `
                                    INSERT INTO benefits
                                    (
                                        name,
                                        created_at,
                                        updated_at
                                    )
                                    VALUES (?, NOW(), NOW())
                                    `,
                                    [item],
                                );

                            benefitId =
                                newBenefit.insertId;
                        }
                    }

                    /**
                     * Attach benefit to applicant/job
                     */
                    await queryRunner.manager.query(
                        `
                        INSERT INTO applicant_job_benefits
                        (
                            benefit_id,
                            job_id,
                            applicant_id,
                            creator_id,
                            updator_id,
                            created_at,
                            updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                        `,
                        [
                            benefitId,
                            dto.job_id,
                            dto.applicant_id,
                            userId,
                            userId,
                        ],
                    );
                }
            }

            /**
             * 9. Interview Rate
             */
            if (
                dto.rate !== undefined &&
                dto.rate !== null
            ) {
                await queryRunner.manager.query(
                    `
                    INSERT INTO applicant_interview_rates
                    (
                        job_id,
                        round_id,
                        applicant_id,
                        user_id,
                        creator_id,
                        rate,
                        description,
                        created_at,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `,
                    [
                        dto.job_id,
                        dto.round_id ?? null,
                        dto.applicant_id,
                        userId,
                        userId,
                        dto.rate,
                        dto.recomandation ?? null,
                    ],
                );
            }

            /**
             * 10. Interview Panel Comment
             */
            if (
                dto.round_id &&
                dto.rate !== undefined
            ) {
                const existingComment =
                    await queryRunner.manager.query(
                        `
                        SELECT id
                        FROM interview_panel_comments
                        WHERE applicant_id = ?
                          AND job_id = ?
                          AND user_id = ?
                          AND round_id = ?
                        LIMIT 1
                        `,
                        [
                            dto.applicant_id,
                            dto.job_id,
                            userId,
                            dto.round_id,
                        ],
                    );

                if (existingComment.length) {
                    await queryRunner.manager.query(
                        `
                        UPDATE interview_panel_comments
                        SET
                            comment = ?,
                            rate = ?,
                            updator_id = ?,
                            updated_at = NOW()
                        WHERE id = ?
                        `,
                        [
                            dto.recomandation ?? null,
                            dto.rate,
                            userId,
                            existingComment[0].id,
                        ],
                    );
                } else {
                    await queryRunner.manager.query(
                        `
                        INSERT INTO interview_panel_comments
                        (
                            comment,
                            rate,
                            job_id,
                            round_id,
                            applicant_id,
                            user_id,
                            creator_id,
                            updator_id,
                            created_at,
                            updated_at
                        )
                        VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            NOW(),
                            NOW()
                        )
                        `,
                        [
                            dto.recomandation ?? null,
                            dto.rate,
                            dto.job_id,
                            dto.round_id,
                            dto.applicant_id,
                            userId,
                            userId,
                            userId,
                        ],
                    );
                }
            }

            /**
             * 11. Commit
             */
            await queryRunner.commitTransaction();

            return {
                status: true,
                message:
                    'Evaluation submitted successfully',

                data: {
                    job_id: dto.job_id,
                    applicant_id:
                        dto.applicant_id,
                    applicant_evaluation_id:
                        applicantEvaluationId,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async getInterviewForm(
        clientId: number,
        applicantId: number,
        jobId: number,
        roundId: number,
    ) {
        const evaluations = await this.evaluationRepository
            .createQueryBuilder('evaluation')

            // Evaluation -> Criteria
            .leftJoinAndMapMany(
                'evaluation.criterias',
                EvaluationCriteria,
                'criteria',
                'criteria.evaluation_id = evaluation.id',
            )

            // Evaluation -> Evaluation Remarks
            .leftJoinAndMapMany(
                'evaluation.evaluation_remarks',
                EvaluationRemark,
                'evaluationRemark',
                'evaluationRemark.evaluation_id = evaluation.id',
            )

            // EvaluationRemark -> Remark
            .leftJoinAndMapOne(
                'evaluationRemark.remark',
                Remark,
                'remark',
                'remark.id = evaluationRemark.remark_id',
            )

            // .where('evaluation.hide = :hide', {
            //     hide: 0,
            // })

            .orderBy(
                'evaluation.priority',
                'ASC',
            )

            .addOrderBy(
                'evaluation.id',
                'ASC',
            )

            .addOrderBy(
                'criteria.id',
                'ASC',
            )

            .addOrderBy(
                'remark.score',
                'ASC',
            )

            .getMany();

        return {
            status: true,
            message: 'Evaluations retrieved successfully',

            data: {
                applicant_id: applicantId,
                job_id: jobId,
                round_id: roundId,
                evaluations,
            },
        };
    }
}