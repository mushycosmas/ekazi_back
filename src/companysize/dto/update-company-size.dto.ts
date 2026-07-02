import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanySizeDto } from './create-company-size.dto';

export class UpdateCompanySizeDto extends PartialType(CreateCompanySizeDto) {}