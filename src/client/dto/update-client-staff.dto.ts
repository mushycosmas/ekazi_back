import { PartialType } from '@nestjs/mapped-types';
import { CreateClientStaffDto } from './create-client-staff.dto';

export class UpdateClientStaffDto extends PartialType(
    CreateClientStaffDto,
) {}