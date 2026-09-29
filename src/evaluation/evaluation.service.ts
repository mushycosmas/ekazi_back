import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
    DataSource,
    Repository,
} from 'typeorm';

import { EvaluationForm } from 'src/entities/evaluation-form.entity';
import { EvaluationRemark } from 'src/entities/evaluation-remark.entity';
import { Remark } from 'src/entities/remark.entity';

import { CreateEvaluationFormDto } from './dto/create-evaluation-form.dto';
import { UpdateEvaluationFormDto } from './dto/update-evaluation-form.dto';
import { StoreOrUpdateEvaluationFormDto } from './dto/store-or-update-evaluation-form.dto';
import { Brackets } from 'typeorm';
import { Evaluation } from 'src/entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationService {

    constructor(
        @InjectRepository(EvaluationForm)
        private readonly evaluationFormRepository: Repository<EvaluationForm>,
        @InjectRepository(Evaluation)
        private readonly evaluationRepository: Repository<Evaluation>,


        @InjectRepository(EvaluationRemark)
        private readonly evaluationRemarkRepository: Repository<EvaluationRemark>,

        @InjectRepository(Remark)
        private readonly remarkRepository: Repository<Remark>,

        private readonly dataSource: DataSource,
    ) { }



    async evaluationIndex(
        userId?: number,
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query = this.evaluationRepository
            .createQueryBuilder('evaluation');



        if (userId) {
            query.andWhere(
                '(evaluation.user_id = :userId OR evaluation.user_id IS NULL)',
                { userId },
            );
        }

        if (search.trim()) {
            query.andWhere(
                new Brackets((qb) => {
                    qb.where(
                        'evaluation.name LIKE :search',
                        {
                            search: `%${search.trim()}%`,
                        },
                    )
                        .orWhere(
                            'evaluation.group LIKE :search',
                            {
                                search: `%${search.trim()}%`,
                            },
                        )
                        .orWhere(
                            'evaluation.description LIKE :search',
                            {
                                search: `%${search.trim()}%`,
                            },
                        );
                }),
            );
        }


        query
            .orderBy('evaluation.created_at', 'DESC')
            .skip(skip)
            .take(limit);

        const [evaluations, total] =
            await query.getManyAndCount();

        return {
            status: true,
            message: 'Evaluations retrieved successfully',
            data: evaluations,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * ============================================================
     * CREATE EVALUATION
     * POST /api/employer/evaluations
     * ============================================================
     */
    async evaluationStore(
        userId: number,
        dto: CreateEvaluationDto,
    ) {
        const evaluation =
            this.evaluationRepository.create({
                group: dto.group,
                priority: dto.priority ?? null,
                name: dto.name,
                description: dto.description,
                hide: dto.hide ?? 0,
                user_id: dto.user_id ?? userId,
                creator_id: userId,
                updator_id: userId,
                created_at: new Date(),
                updated_at: new Date(),
            });

        const saved =
            await this.evaluationRepository.save(
                evaluation,
            );

        return {
            status: true,
            message: 'Evaluation created successfully',
            data: saved,
        };
    }
    /**
     * ============================================================
     * SHOW EVALUATION
     * GET /api/employer/evaluations/:id
     * ============================================================
     */
    async evaluationShow(
        id: number,
        userId?: number,
    ) {
        const query =
            this.evaluationRepository
                .createQueryBuilder('evaluation')
                .leftJoinAndSelect(
                    'evaluation.criterias',
                    'criteria',
                )
                .leftJoinAndSelect(
                    'evaluation.evaluation_remarks',
                    'evaluationRemark',
                )
                .leftJoinAndSelect(
                    'evaluationRemark.remark',
                    'remark',
                )
                .where(
                    'evaluation.id = :id',
                    { id },
                );

        if (userId) {
            query.andWhere(
                '(evaluation.user_id = :userId OR evaluation.user_id IS NULL)',
                { userId },
            );
        }

        const evaluation =
            await query.getOne();

        if (!evaluation) {
            throw new NotFoundException(
                'Evaluation not found.',
            );
        }

        return {
            status: true,
            message: 'Evaluation retrieved successfully',
            data: evaluation,
        };
    }

    /**
 * ============================================================
 * UPDATE EVALUATION
 * PATCH /api/employer/evaluations/:id
 * ============================================================
 */
    async evaluationUpdate(
        id: number,
        userId: number,
        dto: UpdateEvaluationDto,
    ) {
        const evaluation =
            await this.evaluationRepository.findOne({
                where: {
                    id,
                },
            });

        if (!evaluation) {
            throw new NotFoundException(
                'Evaluation not found.',
            );
        }

        /*
         * Prevent editing another user's evaluation
         */
        if (
            evaluation.user_id !== null &&
            evaluation.user_id !== userId
        ) {
            throw new BadRequestException(
                'You are not allowed to update this evaluation.',
            );
        }

        if (dto.group !== undefined) {
            evaluation.group = dto.group;
        }

        if (dto.priority !== undefined) {
            evaluation.priority = dto.priority;
        }

        if (dto.name !== undefined) {
            evaluation.name = dto.name;
        }

        if (dto.description !== undefined) {
            evaluation.description = dto.description;
        }

        if (dto.hide !== undefined) {
            evaluation.hide = dto.hide;
        }

        if (dto.user_id !== undefined) {
            evaluation.user_id = dto.user_id;
        }

        evaluation.updator_id = userId;

        const saved =
            await this.evaluationRepository.save(
                evaluation,
            );

        return {
            status: true,
            message: 'Evaluation updated successfully',
            data: saved,
        };
    }
    /**
 * ============================================================
 * DELETE EVALUATION
 * DELETE /api/employer/evaluations/:id
 * ============================================================
 */
    async evaluationDestroy(
        id: number,
        userId: number,
    ) {
        return await this.dataSource.transaction(
            async (manager) => {

                const evaluationRepository =
                    manager.getRepository(Evaluation);

                const evaluationRemarkRepository =
                    manager.getRepository(EvaluationRemark);

                const evaluation =
                    await evaluationRepository.findOne({
                        where: {
                            id,
                        },
                    });

                if (!evaluation) {
                    throw new NotFoundException(
                        'Evaluation not found.',
                    );
                }

                if (
                    evaluation.user_id !== null &&
                    evaluation.user_id !== userId
                ) {
                    throw new BadRequestException(
                        'You are not allowed to delete this evaluation.',
                    );
                }

                /*
                 * Delete evaluation remarks
                 */
                await evaluationRemarkRepository.delete({
                    evaluation_id: id,
                });

                /*
                 * Delete evaluation
                 */
                await evaluationRepository.delete(id);

                return {
                    status: true,
                    message: 'Evaluation deleted successfully',
                };
            },
        );
    }
    /**
     * ============================================================
     * INDEX
     * GET /api/employer/evaluation-forms
     * ============================================================
     */


    async index(
        clientId: number,
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query = this.evaluationFormRepository
            .createQueryBuilder('form')
            .where('form.client_id = :clientId', { clientId });

        if (search.trim()) {
            query.andWhere(
                new Brackets((qb) => {
                    qb.where('form.title LIKE :search', {
                        search: `%${search.trim()}%`,
                    })
                        .orWhere('form.description LIKE :search', {
                            search: `%${search.trim()}%`,
                        })
                        .orWhere('form.group LIKE :search', {
                            search: `%${search.trim()}%`,
                        });
                }),
            );
        }

        query
            .orderBy('form.created_at', 'DESC')
            .skip(skip)
            .take(limit);

        const [forms, total] = await query.getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            status: true,
            message: 'Evaluation forms retrieved successfully',
            data: forms,
            page,
            limit,
            total,
            totalPages,
        };
    }


    /**
     * ============================================================
     * STORE
     * POST /api/employer/evaluation-forms
     * ============================================================
     */
    async store(
        clientId: number,
        dto: CreateEvaluationFormDto,
    ) {

        return await this.dataSource.transaction(
            async (manager) => {

                const formRepository =
                    manager.getRepository(EvaluationForm);

                const evaluationRemarkRepository =
                    manager.getRepository(EvaluationRemark);

                const remarkRepository =
                    manager.getRepository(Remark);


                /*
                 * Create evaluation form
                 */
                const form =
                    formRepository.create({
                        client_id: clientId,

                        group: dto.group,

                        title: dto.title,

                        description:
                            dto.description ?? null,

                        is_active:
                            dto.is_active ? 1 : 0,
                    });


                const savedForm =
                    await formRepository.save(form);


                /*
                 * Get all default remarks
                 */
                const remarks =
                    await remarkRepository.find();


                /*
                 * Create evaluation remarks
                 */
                if (remarks.length > 0) {

                    const evaluationRemarks =
                        remarks.map((remark) => {

                            const score =
                                Number(remark.score);

                            if (Number.isNaN(score)) {

                                throw new BadRequestException(
                                    `Invalid score "${remark.score}" for remark ID ${remark.id}.`,
                                );
                            }

                            return evaluationRemarkRepository.create({
                                remark_id: remark.id,

                                score,

                                evaluation_id:
                                    savedForm.id,
                            });
                        });


                    await evaluationRemarkRepository.save(
                        evaluationRemarks,
                    );
                }


                /*
                 * Only one active form per client
                 */
                if (savedForm.is_active) {

                    await formRepository
                        .createQueryBuilder()
                        .update(EvaluationForm)
                        .set({
                            is_active: 0,
                        })
                        .where(
                            'client_id = :clientId',
                            {
                                clientId,
                            },
                        )
                        .andWhere(
                            'id != :id',
                            {
                                id: savedForm.id,
                            },
                        )
                        .execute();
                }


                return {
                    message:
                        'Form created successfully.',

                    form: savedForm,
                };
            },
        );
    }


    /**
     * ============================================================
     * SHOW
     * GET /api/employer/evaluation-forms/:id
     * ============================================================
     */
    async show(
        clientId: number,
        id: number,
    ) {

        const form =
            await this.evaluationFormRepository.findOne({
                where: {
                    id,
                    client_id: clientId,
                },
            });


        if (!form) {

            throw new NotFoundException(
                'Evaluation form not found.',
            );
        }


        return form;
    }


    /**
     * ============================================================
     * UPDATE
     * PATCH /api/employer/evaluation-forms/:id
     * ============================================================
     */
    async update(
        clientId: number,
        id: number,
        dto: UpdateEvaluationFormDto,
    ) {

        return await this.dataSource.transaction(
            async (manager) => {

                const formRepository =
                    manager.getRepository(EvaluationForm);

                const evaluationRemarkRepository =
                    manager.getRepository(EvaluationRemark);

                const remarkRepository =
                    manager.getRepository(Remark);


                /*
                 * Find form
                 */
                const form =
                    await formRepository.findOne({
                        where: {
                            id,
                            client_id: clientId,
                        },
                    });


                if (!form) {

                    throw new NotFoundException(
                        'Evaluation form not found.',
                    );
                }


                /*
                 * Update form
                 */
                form.group =
                    dto.group;

                form.title =
                    dto.title;

                form.description =
                    dto.description ?? null;

                form.is_active =
                    dto.is_active ? 1 : 0;


                const savedForm =
                    await formRepository.save(form);


                /*
                 * Delete existing evaluation remarks
                 */
                await evaluationRemarkRepository.delete({
                    evaluation_id: id,
                });


                /*
                 * Get default remarks
                 */
                const remarks =
                    await remarkRepository.find();


                /*
                 * Re-create evaluation remarks
                 */
                if (remarks.length > 0) {

                    const evaluationRemarks =
                        remarks.map((remark) => {

                            const score =
                                Number(remark.score);

                            if (Number.isNaN(score)) {

                                throw new BadRequestException(
                                    `Invalid score "${remark.score}" for remark ID ${remark.id}.`,
                                );
                            }

                            return evaluationRemarkRepository.create({
                                remark_id: remark.id,

                                score,

                                evaluation_id: id,
                            });
                        });


                    await evaluationRemarkRepository.save(
                        evaluationRemarks,
                    );
                }


                /*
                 * Only one active form per client
                 */
                if (savedForm.is_active) {

                    await formRepository
                        .createQueryBuilder()
                        .update(EvaluationForm)
                        .set({
                            is_active: 0,
                        })
                        .where(
                            'client_id = :clientId',
                            {
                                clientId,
                            },
                        )
                        .andWhere(
                            'id != :id',
                            {
                                id,
                            },
                        )
                        .execute();
                }


                return {
                    message:
                        'Form updated successfully.',

                    form: savedForm,
                };
            },
        );
    }


    /**
     * ============================================================
     * DELETE
     * DELETE /api/employer/evaluation-forms/:id
     * ============================================================
     */
    async destroy(
        clientId: number,
        id: number,
    ) {

        return await this.dataSource.transaction(
            async (manager) => {

                const formRepository =
                    manager.getRepository(EvaluationForm);

                const evaluationRemarkRepository =
                    manager.getRepository(EvaluationRemark);


                /*
                 * Find form belonging to client
                 */
                const form =
                    await formRepository.findOne({
                        where: {
                            id,
                            client_id: clientId,
                        },
                    });


                if (!form) {

                    throw new NotFoundException(
                        'Evaluation form not found.',
                    );
                }


                /*
                 * Delete related evaluation remarks
                 */
                await evaluationRemarkRepository.delete({
                    evaluation_id: id,
                });


                /*
                 * Delete form
                 */
                await formRepository.delete(id);


                return {
                    message:
                        'Form deleted successfully.',
                };
            },
        );
    }


    /**
     * ============================================================
     * STORE OR UPDATE
     * POST /api/employer/evaluation-forms/store-or-update
     * ============================================================
     */
    async storeOrUpdate(
        clientId: number,
        dto: StoreOrUpdateEvaluationFormDto,
    ) {

        return await this.dataSource.transaction(
            async (manager) => {

                const formRepository =
                    manager.getRepository(EvaluationForm);

                const evaluationRemarkRepository =
                    manager.getRepository(EvaluationRemark);

                const remarkRepository =
                    manager.getRepository(Remark);


                let form: EvaluationForm;


                /*
                 * ==================================================
                 * UPDATE EXISTING FORM
                 * ==================================================
                 */
                if (dto.form_id) {

                    const existingForm =
                        await formRepository.findOne({
                            where: {
                                id: dto.form_id,
                                client_id: clientId,
                            },
                        });


                    if (!existingForm) {

                        throw new NotFoundException(
                            'Evaluation form not found.',
                        );
                    }


                    existingForm.group =
                        dto.group;

                    existingForm.title =
                        dto.title;

                    existingForm.description =
                        dto.description ?? null;

                    existingForm.is_active =
                        dto.is_active ? 1 : 0;


                    form = existingForm;
                }


                /*
                 * ==================================================
                 * CREATE NEW FORM
                 * ==================================================
                 */
                else {

                    form =
                        formRepository.create({
                            client_id: clientId,

                            group: dto.group,

                            title: dto.title,

                            description:
                                dto.description ?? null,

                            is_active:
                                dto.is_active ? 1 : 0,
                        });
                }


                /*
                 * Save form
                 */
                form =
                    await formRepository.save(form);


                /*
                 * Delete existing remarks
                 */
                await evaluationRemarkRepository.delete({
                    evaluation_id: form.id,
                });


                /*
                 * Get default remarks
                 */
                const remarks =
                    await remarkRepository.find();


                /*
                 * Create evaluation remarks
                 */
                if (remarks.length > 0) {

                    const evaluationRemarks =
                        remarks.map((remark) => {

                            const score =
                                Number(remark.score);


                            if (Number.isNaN(score)) {

                                throw new BadRequestException(
                                    `Invalid score "${remark.score}" for remark ID ${remark.id}.`,
                                );
                            }


                            return evaluationRemarkRepository.create({
                                remark_id: remark.id,

                                score,

                                evaluation_id: form.id,
                            });
                        });


                    await evaluationRemarkRepository.save(
                        evaluationRemarks,
                    );
                }


                /*
                 * Only one active form per client
                 */
                if (form.is_active) {

                    await formRepository
                        .createQueryBuilder()
                        .update(EvaluationForm)
                        .set({
                            is_active: 0,
                        })
                        .where(
                            'client_id = :clientId',
                            {
                                clientId,
                            },
                        )
                        .andWhere(
                            'id != :id',
                            {
                                id: form.id,
                            },
                        )
                        .execute();
                }


                return {
                    message:
                        'Form saved successfully.',

                    form,
                };
            },
        );
    }
}