import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType } from 'src/entities/meta-keywords.entity';

export class CreateMetaKeywordDto {
    @IsEnum(EntityType)
    entity_type: EntityType;

    @IsString()
    name: string;

    @IsOptional()
    creator_id?: number;

    @IsOptional()
    updator_id?: number;
}