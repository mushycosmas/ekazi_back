
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { ApplicantAddressesService } from './applicant-addresses.service';
import { CreateApplicantAddressDto } from './dto/create-applicant-address.dto';
import { UpdateApplicantAddressDto } from './dto/update-applicant-address.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';



function imageUploadOptions(folder: string, prefix: string) {
  const destination = join(
    process.cwd(),
    'uploads',
    folder,
  );

  mkdirSync(destination, { recursive: true });

  return {
    storage: diskStorage({
      destination,
      filename: (_req, file, callback) => {
        callback(
          null,
          `${prefix}_${Date.now()}_${randomUUID()}${extname(file.originalname).toLowerCase()}`,
        );
      },
    }),
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(
          new BadRequestException('Only image files are allowed'),
          false,
        );
      }

      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  };
}

@Controller('applicant/addresses')
@UseGuards(SanctumGuard)
export class ApplicantAddressesController {
    constructor(
        private readonly applicantAddressesService: ApplicantAddressesService,
    ) { }
    @Post()
    create(
        @CurrentUser() user: Users,
        @Body() dto: CreateApplicantAddressDto,
    ) {
        console.log('========== CREATE APPLICANT ADDRESS ==========');
        console.log('Authenticated user ID:', user?.id);
        console.log('Request body:', JSON.stringify(dto, null, 2));
        console.log('region_id:', dto?.region_id);
        console.log('sub_location:', dto?.sub_location);
        console.log('postal:', dto?.postal);
        console.log('==============================================');

        return this.applicantAddressesService.create(user.id, dto);
    }

    @Get()
    findAll(@CurrentUser() user: Users) {
        return this.applicantAddressesService.findAll(user.id);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.applicantAddressesService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateApplicantAddressDto,
    ) {
        return this.applicantAddressesService.update(
            user.id,
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.applicantAddressesService.remove(user.id, id);
    }
}
