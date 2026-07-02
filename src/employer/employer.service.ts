import { Injectable } from '@nestjs/common';
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

        @InjectRepository(ClientPhone)
        private readonly phoneRepository: Repository<ClientPhone>,


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

                    logo: client.logo
                        ? `${this.configService.get('APP_URL')}/${client.logo}`
                        : null,

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
    async updateCompanyProfile(user: Users, dto: UpdateCompanyProfileDto) {
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

            client.updator_id = user.id;
            client.updated_at = new Date();

            await this.clientRepository.save(client);
            // ======================
            // ADDRESS (FIRST RECORD)
            // ======================
            if (client.addresses?.length) {
                const address = client.addresses[0];

                address.region_id = dto.region_id ?? address.region_id;
                address.sub_location = dto.sub_location ?? address.sub_location;
                address.website = dto.website ?? address.website;
                address.location_notes =
                    dto.location_notes ?? address.location_notes;
                address.extra_communication =
                    dto.extra_communication ?? address.extra_communication;

                await this.addressRepository.save(address);
            }

            // ======================
            // EMAIL (FIRST)
            // ======================
            if (dto.email && client.emails?.length) {
                client.emails[0].client_email = dto.email;
                await this.emailRepository.save(client.emails[0]);
            }

            // ======================
            // PHONE (FIRST)
            // ======================
            if (dto.phone && client.phones?.length) {
                client.phones[0].phone_number = dto.phone;
                client.phones[0].fax = dto.fax ?? client.phones[0].fax;

                await this.phoneRepository.save(client.phones[0]);
            }

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
}
