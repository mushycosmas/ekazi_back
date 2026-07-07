import { BadRequestException, Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clients } from 'src/client/clients.entity';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { ClientAddress } from 'src/client/entities/client-address.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { UpdateCompanyProfileDto } from 'src/client/dto/update-company-profile.dto';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ClientDescription } from 'src/client/entities/client-descriptions.entity';

@Injectable()
export class EmployerService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,

        @InjectRepository(ClientAddress)
        private readonly addressRepository: Repository<ClientAddress>,

        @InjectRepository(ClientEmail)
        private readonly emailRepository: Repository<ClientEmail>,

        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,

        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,

        @InjectRepository(ClientPhone)
        private readonly phoneRepository: Repository<ClientPhone>,

        @InjectRepository(ClientDescription)
        private readonly clientDescriptionRepository: Repository<ClientDescription>,



        @InjectRepository(JobStage)
        private readonly jobStageRepository: Repository<JobStage>,


        private readonly configService: ConfigService,
    ) { }
    async employerAccount(user: Users) {
        try {
            const account = await this.usersRepository.findOne({
                where: { id: user.id },
                relations: [
                    'role',
                    'role.permissions',
                ],
            });

            if (!account) {
                throw new InternalServerErrorException({
                    success: false,
                    message: 'User account not found',
                });
            }

            return {
                success: true,
                message: 'Successfully retrieved user account',
                data: {
                    id: account.id,
                    username: account.username,
                    email: account.email,
                    verified: account.verified,
                    role_id: account.role_id,

                    role: account.role?.name,

                    permissions: account.role?.permissions?.map((p) => ({
                        id: p.id,
                        name: p.name,
                    })) || [],
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch employer account',
                error: error.message,
            });
        }
    }

    async getCompanyProfile(user: Users) {
        try {
            if (!user.client_id) {
                throw new NotFoundException('Company not found');
            }

            const client = await this.clientRepository.findOne({
                where: {
                    id: user.client_id,
                },

                relations: [
                    'addresses',
                    'addresses.region',
                    'addresses.region.country',
                    'emails',
                    'phones',
                    'industry',
                    'country',
                    'descriptions',
                    'type',
                    'companySize',
                ],
            });

            if (!client) {
                throw new NotFoundException({
                    success: false,
                    message: 'Company not found',
                });
            }

            return {
                success: true,
                message: 'Successfully retrieved company profile',
                data: {
                    id: client.id,
                    featured: client.featured,
                    is_verified: client.is_verified,

                    name: client.client_name,
                    tin: client.tin,
                    business: client.business,

                    industry: {
                        id: client.industry?.id ?? null,
                        name: client.industry?.industry_name ?? null,
                    },
                    type: {
                        id: client.type.id,
                        type: client.type?.type_name,
                    },
                    company_size: {
                        id: client.companySize?.id ?? null,
                        name: client.companySize?.name ?? null,
                    },

                    description: client.descriptions?.[0]
                        ? {
                            id: client.descriptions[0].id,
                            text: client.descriptions[0].description,
                            website: client.descriptions[0].website,
                            attachment: client.descriptions[0].attachment,
                        }
                        : null,

                    founded_year: client.founded_year,

                    logo: client.logo ? client.logo : null,

                    email: client.emails?.[0]?.client_email ?? null,

                    phone: client.phones?.[0]?.phone_number ?? null,

                    fax: client.phones?.[0]?.fax ?? null,



                    country: {
                        id: client.country?.id ?? null,
                        name: client.country?.name ?? null,
                    },


                    address: {
                        region_id: client.addresses?.[0]?.region_id ?? null,
                        region_name: client.addresses?.[0]?.region?.region_name ?? null,

                        sub_location: client.addresses?.[0]?.sub_location ?? null,
                        website: client.addresses?.[0]?.website ?? null,
                        location_notes: client.addresses?.[0]?.location_notes ?? null,
                        extra_communication: client.addresses?.[0]?.extra_communication ?? null,
                    },
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch company profile',
                error: error.message,
            });
        }
    }
    async updateCompanyProfile(user: Users, dto: UpdateCompanyProfileDto, file?: Express.Multer.File,) {
        try {
            if (!user.client_id) {
                throw new NotFoundException('Company not found');
            }

            const client = await this.clientRepository.findOne({
                where: { id: user.client_id },
                relations: [
                    'addresses',
                    'emails',
                    'phones',
                    'descriptions',
                ],
            });

            if (!client) {
                throw new NotFoundException('Company not found');
            }

            // ======================
            // CLIENT MAIN DATA
            // ======================
            client.client_name = dto.client_name ?? client.client_name;
            client.tin = dto.tin ?? client.tin;
            client.business = dto.business ?? client.business;
            client.additional_info =
                dto.additional_info ?? client.additional_info;

            // founded_year is a timestamp
            if (dto.founded_year) {
                client.founded_year = new Date(dto.founded_year);
            }

            client.type_id = dto.type_id ?? client.type_id;
            client.industry_id = dto.industry_id ?? client.industry_id;
            client.company_size_id =
                dto.company_size_id ?? client.company_size_id;
            client.country_id = dto.country_id ?? client.country_id;
            if (file) {
                client.logo = file.path.replace(process.cwd(), '')
                    .replace(/\\/g, '/')
                    .replace(/^\/+/, '');
            }
            client.updator_id = user.id;
            client.updated_at = new Date();

            await this.clientRepository.save(client);
            // ======================
            // ADDRESS (FIRST RECORD)
            // ======================
            let address = client.addresses?.[0];

            if (!address) {
                address = this.addressRepository.create({
                    client_id: client.id,
                });
            }

            address.region_id = dto.region_id ?? address.region_id;
            address.sub_location = dto.sub_location ?? address.sub_location;
            address.website = dto.website ?? address.website;
            address.location_notes =
                dto.location_notes ?? address.location_notes;
            address.extra_communication =
                dto.extra_communication ?? address.extra_communication;

            await this.addressRepository.save(address);

            // ======================
            // EMAIL (FIRST)
            // ======================
            let email = client.emails?.[0];

            if (!email) {
                email = this.emailRepository.create({
                    client_id: client.id,
                });
            }

            email.client_email = dto.email ?? email.client_email;

            await this.emailRepository.save(email);

            // ======================
            // PHONE (FIRST)
            // ======================
            let phone = client.phones?.[0];

            if (!phone) {
                phone = this.phoneRepository.create({
                    client_id: client.id,
                });
            }

            phone.phone_number = dto.phone ?? phone.phone_number;
            phone.fax = dto.fax ?? phone.fax;

            await this.phoneRepository.save(phone);
            // ======================
            // DESCRIPTION (FIRST RECORD)
            // ======================
            let description = client.descriptions?.[0];

            if (!description) {
                description = this.clientDescriptionRepository.create({
                    client_id: client.id,
                });
            }

            description.description =
                dto.description ?? description.description;

            description.website =
                dto.website ?? description.website;

            if (file) {
                description.attachment = file.path
                    .replace(process.cwd(), '')
                    .replace(/\\/g, '/')
                    .replace(/^\/+/, '');
            }

            await this.clientDescriptionRepository.save(description);

            return {
                success: true,
                message: 'Company profile updated successfully',
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to update company profile',
                error: error.message,
            });
        }
    }

    async getApplicantsByJob(
        user: Users,
        jobId: number,
        page = 1,
        limit = 20,
        search?: string,
        stageId?: number,
    ) {
        try {
            // Ensure the job belongs to the employer
            if (!user.client_id) {
                throw new NotFoundException('No company is associated with this user.');
            }

            const job = await this.jobsRepository.findOne({
                where: {
                    id: jobId,
                    client_id: user.client_id,
                },
            });

            if (!job) {
                throw new NotFoundException(
                    'Job not found or you do not have permission to view applicants.',
                );
            }

            const query = this.applicationRepository
                .createQueryBuilder('application')
                .leftJoinAndSelect('application.stage', 'stage')
                .leftJoinAndSelect('application.applicant', 'user')
                // .leftJoinAndSelect('user.applicants', 'applicant')
                .leftJoinAndSelect('user.applicants', 'applicantProfile')
                .leftJoinAndSelect(
                    'applicant.applicant_addresses',
                    'address',
                )
                .leftJoinAndSelect(
                    'applicant.applicant_phones',
                    'phone',
                )
                .leftJoinAndSelect(
                    'applicant.positions',
                    'position',
                )
                .where('application.job_id = :jobId', {
                    jobId,
                });

            // Stage Filter
            if (stageId) {
                query.andWhere(
                    'application.stage_id = :stageId',
                    {
                        stageId: Number(stageId),
                    },
                );
            }
            // Search
            if (search) {
                query.andWhere(
                    `
                (
                    applicant.first_name LIKE :search
                    OR applicant.middle_name LIKE :search
                    OR applicant.last_name LIKE :search
                    OR user.email LIKE :search
                    OR phone.phone_number LIKE :search
                    OR position.position_name LIKE :search
                )
                `,
                    {
                        search: `%${search}%`,
                    },
                );
            }

            const total = await query.getCount();
            const applications = await query
                .orderBy('application.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            const data = applications.map((item) => ({
                id: item.id,
                status: item.status,
                letter: item.letter,

                stage: item.stage
                    ? {
                        id: item.stage.id,
                        name: item.stage.stage_name,
                        code: item.stage.stage_code,
                    }
                    : null,

                applicant: item.applicant
                    ? {
                        id: item.applicant.id,
                        email: item.applicant.email,

                        first_name:
                            item.applicant.applicants?.[0]?.first_name ?? '',
                        middle_name:
                            item.applicant.applicants?.[0]?.middle_name ?? '',
                        last_name:
                            item.applicant.applicants?.[0]?.last_name ?? '',
                    }
                    : null,

                applied_at: item.created_at,
            }));

            return {
                success: true,
                message: 'Applicants retrieved successfully',
                data,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
                total,
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch applicants',
                error: error.message,
            });
        }
    }

    async getJobStageHistory(
        user: Users,
        jobId: number,
        page = 1,
        limit = 20,
        search?: string,
        stageId?: number,
    ) {
        try {
            // Ensure employer owns this job
            if (!user.client_id) {
                throw new BadRequestException('Employer has no company.');
            }

            const job = await this.jobsRepository.findOne({
                where: {
                    id: jobId,
                    client_id: user.client_id,
                },
            });

            if (!job) {
                throw new NotFoundException('Job not found.');
            }

            const query = this.jobStageRepository
                .createQueryBuilder('history')

                .leftJoinAndSelect('history.stage', 'stage')

                .leftJoinAndSelect('history.applicant', 'applicant')

                .leftJoinAndSelect('applicant.user', 'user')

                .where('history.job_id = :jobId', {
                    jobId,
                });

            // ==========================
            // FILTER BY STAGE
            // ==========================

            if (stageId) {
                query.andWhere('history.stage_id = :stageId', {
                    stageId,
                });
            }

            // ==========================
            // SEARCH
            // ==========================

            if (search) {
                query.andWhere(
                    `(
                    applicant.first_name LIKE :search
                    OR applicant.middle_name LIKE :search
                    OR applicant.last_name LIKE :search
                    OR user.email LIKE :search
                )`,
                    {
                        search: `%${search}%`,
                    },
                );
            }

            query.orderBy('history.created_at', 'DESC');

            const total = await query.getCount();

            const histories = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            const data = histories.map((item) => ({
                id: item.id,

                applicant: {
                    id: item.applicant.id,
                    first_name: item.applicant.first_name,
                    middle_name: item.applicant.middle_name,
                    last_name: item.applicant.last_name,
                    email: item.applicant.user?.email,
                    picture: item.applicant.picture,
                },

                stage: {
                    id: item.stage.id,
                    name: item.stage.stage_name,
                    code: item.stage.stage_code,
                },

                moved_at: item.created_at,
            }));

            return {
                success: true,
                message: 'Applicants stage history fetched successfully.',
                data,

                current_page: page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch applicants.',
                error: error.message,
            });
        }
    }
}
