import {
IsArray,
IsInt,
IsOptional,
IsString
} from 'class-validator';


export class BulkShortListDto {


@IsInt()
job_id:number;


@IsInt()
stage_id:number;


@IsString()
stage_name:string;



@IsArray()
applicant_id:number[];



@IsOptional()
@IsInt()
region_id:number;



@IsOptional()
position_name:string;



@IsOptional()
address:string;



@IsOptional()
invite_date:string;



@IsOptional()
message_body:string;

}