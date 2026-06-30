import { Controller, Get, UseGuards } from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EmployerJobsService } from './services/employer-jobs.service';

@Controller('employer')
export class EmployerController {


}
