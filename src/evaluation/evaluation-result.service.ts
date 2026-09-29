 import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import { SaveEvaluationResultDto } from './dto/save-evaluation-result.dto';
import { PreparedBulkInterviewDto } from './dto/bulk-prepared-interview.dto';
import { PanelCommentDto } from './dto/panel-comment.dto';
import { PreparedInterviewDto } from './dto/prepared-interview.dto';

@Injectable()
export class EvaluationResultService {
    constructor(
        private readonly dataSource: DataSource,
    ) {}

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
            const application = await queryRunner.manager.query(
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
            let availabilityDate: Date = new Date();

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
                        interview_action_id = ?,
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
                        dto.interview_action_id ?? null,
                        availabilityDate,
                        dto.summary_id ?? null,
                        dto.evaluation_action_id ?? null,
                        userId,
                        applicantEvaluationId,
                    ],
                );
            } else {
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
                            interview_action_id,
                            availability_date,
                            evaluation_summary_id,
                            evaluation_action_id,
                            creator_id,
                            updator_id,
                            created_at,
                            updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        `,
                        [
                            dto.applicant_id,
                            dto.job_id,
                            dto.relevant_experience ?? null,
                            dto.salary_expectation ?? null,
                            availability,
                            dto.recomandation ?? null,
                            dto.interview_action_id ?? null,
                            availabilityDate,
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
                for (const positionId of dto.position_id) {
                    if (!positionId) continue;

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
            await queryRunner.manager.query(
                `
                DELETE FROM applicant_job_benefits
                WHERE job_id = ?
                  AND applicant_id = ?
                `,
                [
                    dto.job_id,
                    dto.applicant_id,
                ],
            );

            /**
             * 8. Save benefits
             */
            if (dto.benefit_id?.length) {
                for (const item of dto.benefit_id) {
                    let benefitId: number;

                    if (
                        !Number.isNaN(
                            Number(item),
                        )
                    ) {
                        benefitId = Number(item);
                    } else {
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

                        if (existingBenefit.length) {
                            benefitId =
                                existingBenefit[0].id;
                        } else {
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
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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

            await queryRunner.commitTransaction();

            return {
                status: true,
                message: 'Evaluation submitted successfully',
                data: {
                    job_id: dto.job_id,
                    applicant_id: dto.applicant_id,
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
}