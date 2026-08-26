import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    Repository,
} from 'typeorm';

 
import { CreateSubscriptionPlanFeatureDto } from './dto/create-subscription-plan-feature.dto';
import { UpdateSubscriptionPlanFeatureDto } from './dto/update-subscription-plan-feature.dto';
import { SubscriptionFeature } from 'src/payment/entities/subscription-feature.entity';


import {
    SubscriptionPlan,
} from 'src/payment/entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlanFeaturesService {

    constructor(

        @InjectRepository(
            SubscriptionFeature,
        )
        private readonly featureRepository:
            Repository<SubscriptionFeature>,

        @InjectRepository(
            SubscriptionPlan,
        )
        private readonly planRepository:
            Repository<SubscriptionPlan>,

    ) { }

    // ============================================================
    // CREATE
    // ============================================================

    async create(
        dto: CreateSubscriptionPlanFeatureDto,
    ) {

            const feature =
            this.featureRepository.create({
                feature_name: dto.feature_name,
            });

        const saved =
            await this.featureRepository.save(
                feature,
            );

        return {
            success: true,
            message:
                'Subscription plan feature created successfully',
            data: saved,
        };
    }

    // ============================================================
    // FIND ALL
    // ============================================================

    async findAll(
        page: number = 1,
        limit: number = 20,
    ) {
        page = Math.max(1, Number(page));
        limit = Math.max(1, Number(limit));

        const skip = (page - 1) * limit;

        const query = this.featureRepository
            .createQueryBuilder('feature')
           
            .select([
                'feature.id',
                
                'feature.feature_name',
                'feature.created_at',
                'feature.updated_at',
                
            ])
            .orderBy(
                'feature.id',
                'DESC',
            )
            .skip(skip)
            .take(limit);

        const [features, total] =
            await query.getManyAndCount();

        const totalPages =
            Math.ceil(total / limit);

        const data = features.map(
            (feature) => ({
                id: feature.id,

                name:
                    feature.feature_name,

                created_at:
                    feature.created_at,

                updated_at:
                    feature.updated_at,
            }),
        );

        return {
            success: true,

            message:
                'Subscription plan features retrieved successfully',

            data,
            page,
            limit,
            total,
            totalPages: totalPages,
        };
    }

    // ============================================================
    // FIND ONE
    // ============================================================

    async findOne(id: number) {

        const feature =
            await this.featureRepository.findOne({
                where: {
                    id,
                },
              
            });

        if (!feature) {
            throw new NotFoundException(
                'Subscription plan feature not found',
            );
        }

        return {
            success: true,
            message:
                'Subscription plan feature retrieved successfully',
            data: feature,
        };
    }

    // ============================================================
    // FIND BY PLAN
    // ============================================================

 

    // ============================================================
    // UPDATE
    // ============================================================

    async update(
        id: number,
        dto: UpdateSubscriptionPlanFeatureDto,
    ) {

        const feature =
            await this.featureRepository.findOne({
                where: {
                    id,
                },
            });

        if (!feature) {
            throw new NotFoundException(
                'Subscription plan feature not found',
            );
        }

    

        if (
            dto.feature_name !== undefined
        ) {
            feature.feature_name =
                dto.feature_name;
        }

        const updated =
            await this.featureRepository.save(
                feature,
            );

        return {
            success: true,
            message:
                'Subscription plan feature updated successfully',
            data: updated,
        };
    }

    // ============================================================
    // DELETE
    // ============================================================

    async remove(id: number) {

        const feature =
            await this.featureRepository.findOne({
                where: {
                    id,
                },
            });

        if (!feature) {
            throw new NotFoundException(
                'Subscription plan feature not found',
            );
        }

        await this.featureRepository.remove(
            feature,
        );

        return {
            success: true,
            message:
                'Subscription plan feature deleted successfully',
        };
    }
}