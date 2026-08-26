import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    DataSource,
    Repository,
} from 'typeorm';

import {
    SubscriptionPlan,
} from 'src/payment/entities/subscription-plan.entity';

import {
    PlanFeature,
} from 'src/payment/entities/plan-feature.entity';

import {
    SubscriptionFeature,
} from 'src/payment/entities/subscription-feature.entity';

import {
    CreateSubscriptionPlanDto,
} from './dto/create-subscription-plan.dto';

import {
    UpdateSubscriptionPlanDto,
} from './dto/update-subscription-plan.dto';


@Injectable()
export class SubscriptionPlansService {

    constructor(

        @InjectRepository(SubscriptionPlan)
        private readonly planRepository:
            Repository<SubscriptionPlan>,

        @InjectRepository(PlanFeature)
        private readonly planFeatureRepository:
            Repository<PlanFeature>,

        @InjectRepository(SubscriptionFeature)
        private readonly featureRepository:
            Repository<SubscriptionFeature>,

        private readonly dataSource:
            DataSource,

    ) {}


    // =====================================================
    // CREATE
    // =====================================================

    async create(
        dto: CreateSubscriptionPlanDto,
    ) {

        const {
            features,
            ...planData
        } = dto;


        // ---------------------------------------------
        // Validate features
        // ---------------------------------------------

        if (features?.length) {

            const uniqueFeatureIds =
                [...new Set(features)];

            const featureCount =
                await this.featureRepository.count({
                    where: uniqueFeatureIds.map(
                        id => ({
                            id,
                        }),
                    ),
                });

            if (
                featureCount !==
                uniqueFeatureIds.length
            ) {
                throw new BadRequestException(
                    'One or more feature IDs do not exist',
                );
            }
        }


        // ---------------------------------------------
        // TRANSACTION
        // ---------------------------------------------

        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            // -----------------------------------------
            // CREATE PLAN
            // -----------------------------------------

            const plan =
                queryRunner.manager.create(
                    SubscriptionPlan,
                    planData,
                );

            const savedPlan =
                await queryRunner.manager.save(
                    SubscriptionPlan,
                    plan,
                );


            // -----------------------------------------
            // CREATE PLAN FEATURES
            // -----------------------------------------

            if (features?.length) {

                const uniqueFeatureIds =
                    [...new Set(features)];

                const planFeatures =
                    uniqueFeatureIds.map(
                        featureId =>
                            queryRunner.manager.create(
                                PlanFeature,
                                {
                                    plan_id:
                                        savedPlan.id,

                                    feature_id:
                                        featureId,
                                },
                            ),
                    );

                await queryRunner.manager.save(
                    PlanFeature,
                    planFeatures,
                );
            }


            await queryRunner.commitTransaction();


            // -----------------------------------------
            // RETURN COMPLETE PLAN
            // -----------------------------------------

            return await this.findOne(
                savedPlan.id,
            );

        } catch (error) {

            await queryRunner.rollbackTransaction();

            throw error;

        } finally {

            await queryRunner.release();
        }
    }


    // =====================================================
    // FIND ALL
    // =====================================================

    async findAll(
        page: number = 1,
        limit: number = 10,
    ) {

        page =
            Math.max(
                1,
                Number(page),
            );

        limit =
            Math.max(
                1,
                Math.min(
                    100,
                    Number(limit),
                ),
            );


        const skip =
            (page - 1) * limit;


        const [
            plans,
            total,
        ] =
            await this.planRepository.findAndCount({

                relations: {
                    planFeatures: {
                        feature: true,
                    },
                },

                order: {
                    id: 'DESC',
                },

                skip,

                take: limit,
            });


        // ---------------------------------------------
        // CLEAN RESPONSE
        // ---------------------------------------------

        const data =
            plans.map(
                plan => ({

                    id:
                        plan.id,

                    name:
                        plan.name,

                    price:
                        plan.price,

                    role:
                        plan.role,

                    current_type:
                        plan.current_type,

                    duration_days:
                        plan.duration_days,

                    job_post_limit:
                        plan.job_post_limit,

                    cv_download_limit:
                        plan.cv_download_limit,

                    cv_builder_limit:
                        plan.cv_builder_limit,

                  

                    popular:
                        plan.popular,

                    is_active:
                        plan.is_active,

                    features:
                        plan.planFeatures?.map(
                            planFeature => ({
                                id:
                                    planFeature.feature.id,

                                name:
                                    planFeature.feature.feature_name,
                            }),
                        ) ?? [],

                    created_at:
                        plan.created_at,

                    updated_at:
                        plan.updated_at,
                }),
            );


        const totalPages =
            Math.ceil(
                total / limit,
            );


        return {

            success: true,

            message:
                'Subscription plans retrieved successfully',

            data,

            page,

            limit,

            total,

            totalPages,
        };
    }


    // =====================================================
    // FIND ONE
    // =====================================================

    async findOne(
        id: number,
    ) {

        const plan =
            await this.planRepository.findOne({

                where: {
                    id,
                },

                relations: {
                    planFeatures: {
                        feature: true,
                    },
                },
            });


        if (!plan) {

            throw new NotFoundException(
                `Subscription plan with ID ${id} not found`,
            );
        }


        return {

            success: true,

            message:
                'Subscription plan retrieved successfully',

            data: {

                id:
                    plan.id,

                name:
                    plan.name,

                price:
                    plan.price,

                role:
                    plan.role,

                current_type:
                    plan.current_type,

                duration_days:
                    plan.duration_days,

                job_post_limit:
                    plan.job_post_limit,

                cv_download_limit:
                    plan.cv_download_limit,

                cv_builder_limit:
                    plan.cv_builder_limit,

               

                popular:
                    plan.popular,

                is_active:
                    plan.is_active,

                features:
                    plan.planFeatures?.map(
                        planFeature => ({

                            id:
                                planFeature.feature.id,

                            name:
                                planFeature.feature.feature_name,

                        }),
                    ) ?? [],

                created_at:
                    plan.created_at,

                updated_at:
                    plan.updated_at,
            },
        };
    }


    // =====================================================
    // UPDATE
    // =====================================================

    async update(
        id: number,
        dto: UpdateSubscriptionPlanDto,
    ) {

        const {
            features,
            ...planData
        } = dto;


        // ---------------------------------------------
        // CHECK PLAN
        // ---------------------------------------------

        const plan =
            await this.planRepository.findOne({
                where: {
                    id,
                },
            });


        if (!plan) {

            throw new NotFoundException(
                `Subscription plan with ID ${id} not found`,
            );
        }


        // ---------------------------------------------
        // VALIDATE FEATURES
        // ---------------------------------------------

        if (features !== undefined) {

            const uniqueFeatureIds =
                [...new Set(features)];


            if (
                uniqueFeatureIds.length > 0
            ) {

                const featureCount =
                    await this.featureRepository.count({
                        where:
                            uniqueFeatureIds.map(
                                featureId => ({
                                    id: featureId,
                                }),
                            ),
                    });


                if (
                    featureCount !==
                    uniqueFeatureIds.length
                ) {

                    throw new BadRequestException(
                        'One or more feature IDs do not exist',
                    );
                }
            }
        }


        // ---------------------------------------------
        // TRANSACTION
        // ---------------------------------------------

        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();


        try {

            // -----------------------------------------
            // UPDATE PLAN
            // -----------------------------------------

            Object.assign(
                plan,
                planData,
            );


            await queryRunner.manager.save(
                SubscriptionPlan,
                plan,
            );


            // -----------------------------------------
            // REPLACE FEATURES
            // -----------------------------------------

            if (features !== undefined) {

                await queryRunner.manager.delete(
                    PlanFeature,
                    {
                        plan_id: id,
                    },
                );


                const uniqueFeatureIds =
                    [...new Set(features)];


                if (
                    uniqueFeatureIds.length
                ) {

                    const planFeatures =
                        uniqueFeatureIds.map(
                            featureId =>
                                queryRunner.manager.create(
                                    PlanFeature,
                                    {
                                        plan_id:
                                            id,

                                        feature_id:
                                            featureId,
                                    },
                                ),
                        );


                    await queryRunner.manager.save(
                        PlanFeature,
                        planFeatures,
                    );
                }
            }


            await queryRunner.commitTransaction();


            return await this.findOne(id);

        } catch (error) {

            await queryRunner.rollbackTransaction();

            throw error;

        } finally {

            await queryRunner.release();
        }
    }


    // =====================================================
    // DELETE
    // =====================================================

    async remove(
        id: number,
    ) {

        const plan =
            await this.planRepository.findOne({
                where: {
                    id,
                },
            });


        if (!plan) {

            throw new NotFoundException(
                `Subscription plan with ID ${id} not found`,
            );
        }


        await this.planRepository.remove(
            plan,
        );


        return {

            success: true,

            message:
                'Subscription plan deleted successfully',

            data: null,
        };
    }
}