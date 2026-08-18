import { PartialType } from '@nestjs/mapped-types';
import { CreateClientStaffPositionDto } from './create-client-staff-position.dto';

export class UpdateClientStaffPositionDto extends PartialType(
    CreateClientStaffPositionDto,
) {}
 