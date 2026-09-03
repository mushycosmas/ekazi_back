import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Clients } from 'src/client/clients.entity';
import { ClientAddress } from 'src/client/entities/client-address.entity';
import { ClientDescription } from 'src/client/entities/client-descriptions.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Users } from 'src/entities/users.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminClientsService {

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


    async totalRecruiters(
        page: number = 1,
        limit: number = 20,
        search?: string,
        featured?: string,
    ) {
        try {
            page = Math.max(1, Number(page) || 1);
            limit = Math.min(100, Math.max(1, Number(limit) || 20));

            const skip = (page - 1) * limit;

            const query = this.clientRepository
                .createQueryBuilder('client')

                .leftJoinAndSelect(
                    'client.addresses',
                    'addresses',
                )

                .leftJoinAndSelect(
                    'client.type',
                    'type',
                )

                // Search email
                .leftJoin(
                    'client.emails',
                    'emails',
                )

                // Search phone
                .leftJoin(
                    'client.phones',
                    'phones',
                );
            // Featured filter
            if (featured !== undefined) {
                query.andWhere(
                    'client.featured = :featured',
                    {
                        featured:
                            featured === 'true' ||
                                featured === '1'
                                ? true
                                : false,
                    },
                );
            }


            // Search
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
                    client.client_name LIKE :keyword
                    OR client.tin LIKE :keyword
                    OR client.business LIKE :keyword
                    OR emails.client_email LIKE :keyword
                    OR phones.phone_number LIKE :keyword
                )`,
                    {
                        keyword,
                    },
                );
            }

            query
                .orderBy('client.id', 'DESC')
                .skip(skip)
                .take(limit);

            const [clients, total] =
                await query.getManyAndCount();

            /*
 |--------------------------------------------------------------------------
 | Statistics
 |--------------------------------------------------------------------------
 |
 | These are calculated from ALL clients,
 | not only the current page.
 |
 */

            const totalClients =
                await this.clientRepository.count();

            const verifiedClients =
                await this.clientRepository.count({
                    where: {
                        is_verified: 1,
                    },
                });

            const unverifiedClients =
                await this.clientRepository.count({
                    where: {
                        is_verified: 0,
                    },
                });

            // const activeClients =
            //     await this.clientRepository.count({
            //         where: {
            //             active: 1,
            //         },
            //     });

            // const inactiveClients =
            //     await this.clientRepository.count({
            //         where: {
            //             active: 0,
            //         },
            //     });

            /**
             * Get total jobs for each client
             */
            const data = await Promise.all(
                clients.map(async (client) => {

                    const totalJobs =
                        await this.jobsRepository.count({
                            where: {
                                client_id: client.id,
                            },
                        });

                    return {
                        id: client.id,

                        featured: client.featured,

                        is_verified: client.is_verified,

                        name: client.client_name,

                        tin: client.tin,

                        business: client.business,

                        description:
                            client.descriptions?.[0]
                                ? {
                                    id:
                                        client.descriptions[0].id,

                                    text:
                                        client.descriptions[0]
                                            .description,

                                    website:
                                        client.descriptions[0]
                                            .website,

                                    attachment:
                                        client.descriptions[0]
                                            .attachment,
                                }
                                : null,

                        founded_year:
                            client.founded_year,

                        logo:
                            client.logo ?? null,

                        // Total jobs
                        total_jobs: totalJobs,
                    };
                }),
            );

            const totalPages =
                Math.ceil(total / limit);

            return {
                success: true,

                message:
                    'Successfully retrieved company profiles',

                data,

                statistics: {
                    total_clients: totalClients,

                    verified_clients: verifiedClients,

                    unverified_clients: unverifiedClients,

                    // active_clients: activeClients,

                    // inactive_clients: inactiveClients,
                },


                total,

                page,

                limit,

                totalPages,

            };

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,

                message:
                    'Failed to fetch company profiles',

                error: error.message,
            });
        }
    }



    async totalEmpoyers(
        page: number = 1,
        limit: number = 20,
        search?: string,
        featured?: string,
    ) {
        try {
            page = Math.max(1, Number(page) || 1);
            limit = Math.min(100, Math.max(1, Number(limit) || 20));

            const skip = (page - 1) * limit;

            // const query = this.clientRepository
            //     .createQueryBuilder('client')

            //     .leftJoinAndSelect(
            //         'client.addresses',
            //         'addresses',
            //     )

            //     .leftJoinAndSelect(
            //         'client.type',
            //         'type',
            //     )

            //     // Search email
            //     .leftJoin(
            //         'client.emails',
            //         'emails',
            //     )

            //     // Search phone
            //     .leftJoin(
            //         'client.phones',
            //         'phones',
            //     );
            const query = this.clientRepository
                .createQueryBuilder('client')
                .leftJoinAndSelect(
                    'client.addresses',
                    'addresses',
                )
                .leftJoinAndSelect(
                    'client.type',
                    'type',
                )
                .leftJoin(
                    'client.emails',
                    'emails',
                )
                .leftJoin(
                    'client.phones',
                    'phones',
                );

            // Featured filter
            if (featured !== undefined) {
                query.andWhere(
                    'client.featured = :featured',
                    {
                        featured:
                            featured === 'true' ||
                                featured === '1'
                                ? true
                                : false,
                    },
                );
            }

            // Search
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
                    client.client_name LIKE :keyword
                    OR client.tin LIKE :keyword
                    OR client.business LIKE :keyword
                    OR emails.client_email LIKE :keyword
                    OR phones.phone_number LIKE :keyword
                )`,
                    {
                        keyword,
                    },
                );
            }

            query
                .orderBy('client.id', 'DESC')
                .skip(skip)
                .take(limit);

            const [clients, total] =
                await query.getManyAndCount();


            /*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
|
| These are calculated from ALL clients,
| not only the current page.
|
*/

            const totalClients =
                await this.clientRepository.count();

            const verifiedClients =
                await this.clientRepository.count({
                    where: {
                        is_verified: 1,
                    },
                });

            const unverifiedClients =
                await this.clientRepository.count({
                    where: {
                        is_verified: 0,
                    },
                });

            // const activeClients =
            //     await this.clientRepository.count({
            //         where: {
            //             active: 1,
            //         },
            //     });

            // const inactiveClients =
            //     await this.clientRepository.count({
            //         where: {
            //             active: 0,
            //         },
            //     });

            /**
             * Get total jobs for each client
             */
            const data = await Promise.all(
                clients.map(async (client) => {

                    const totalJobs =
                        await this.jobsRepository.count({
                            where: {
                                client_id: client.id,
                            },
                        });

                    return {
                        id: client.id,

                        featured: client.featured,

                        is_verified: client.is_verified,

                        name: client.client_name,

                        tin: client.tin,

                        business: client.business,

                        description:
                            client.descriptions?.[0]
                                ? {
                                    id:
                                        client.descriptions[0].id,

                                    text:
                                        client.descriptions[0]
                                            .description,

                                    website:
                                        client.descriptions[0]
                                            .website,

                                    attachment:
                                        client.descriptions[0]
                                            .attachment,
                                }
                                : null,

                        founded_year:
                            client.founded_year,

                        logo:
                            client.logo ?? null,

                        // Total jobs
                        total_jobs: totalJobs,
                    };
                }),
            );

            const totalPages =
                Math.ceil(total / limit);

            return {
                success: true,

                message:
                    'Successfully retrieved company profiles',

                data,

                statistics: {
                    total_clients: totalClients,

                    verified_clients: verifiedClients,

                    unverified_clients: unverifiedClients,

                    // active_clients: activeClients,

                    // inactive_clients: inactiveClients,
                },

                total,

                page,

                limit,

                totalPages,

            };

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,

                message:
                    'Failed to fetch company profiles',

                error: error.message,
            });
        }
    }
 async CompanyProfilesDetail(clientId: number) {
    try {
        clientId = Number(clientId);

        if (!clientId || clientId <= 0) {
            throw new BadRequestException({
                success: false,
                message: 'Invalid client ID',
            });
        }

        const client = await this.clientRepository
            .createQueryBuilder('client')

            .leftJoinAndSelect('client.addresses', 'addresses')
            .leftJoinAndSelect('addresses.region', 'region')
            .leftJoinAndSelect('region.country', 'addressCountry')

            .leftJoinAndSelect('client.emails', 'emails')
            .leftJoinAndSelect('client.phones', 'phones')

            .leftJoinAndSelect('client.industry', 'industry')
            .leftJoinAndSelect('client.country', 'country')
            .leftJoinAndSelect('client.descriptions', 'descriptions')
            .leftJoinAndSelect('client.type', 'type')
            .leftJoinAndSelect('client.companySize', 'companySize')

            .where('client.id = :clientId', { clientId })

            .getOne();

        if (!client) {
            throw new NotFoundException({
                success: false,
                message: `Company profile with ID ${clientId} not found`,
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
                    id: client.type?.id ?? null,
                    type: client.type?.type_name ?? null,
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

                logo: client.logo ?? null,

                email: client.emails?.[0]?.client_email ?? null,

                phone: client.phones?.[0]?.phone_number ?? null,

                fax: client.phones?.[0]?.fax ?? null,

                country: {
                    id: client.country?.id ?? null,
                    name: client.country?.name ?? null,
                },

                address: {
                    region_id:
                        client.addresses?.[0]?.region_id ?? null,

                    region_name:
                        client.addresses?.[0]?.region?.region_name ?? null,

                    sub_location:
                        client.addresses?.[0]?.sub_location ?? null,

                    website:
                        client.addresses?.[0]?.website ?? null,

                    location_notes:
                        client.addresses?.[0]?.location_notes ?? null,

                    extra_communication:
                        client.addresses?.[0]?.extra_communication ?? null,
                },
            },
        };

    } catch (error) {

        if (error instanceof HttpException) {
            throw error;
        }

        throw new InternalServerErrorException({
            success: false,
            message: 'Failed to fetch company profile',
            error: error.message,
        });
    }
}
}
