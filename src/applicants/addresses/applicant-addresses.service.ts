
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantAddresses } from 'src/entities/applicants/applicant-addresses.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Regions } from 'src/entities/regions.entity';
import { ApplicantPhones } from 'src/entities/applicants/applicant-phones.entity';

import { CreateApplicantAddressDto } from './dto/create-applicant-address.dto';
import { UpdateApplicantAddressDto } from './dto/update-applicant-address.dto';
import { Genders } from 'src/entities/genders.entity';
import { MaritalStatuses } from 'src/entities/marital-statuses.entity';

@Injectable()
export class ApplicantAddressesService {
    constructor(
        @InjectRepository(ApplicantAddresses)
        private readonly addressesRepo: Repository<ApplicantAddresses>,

        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,

        @InjectRepository(Regions)
        private readonly regionsRepo: Repository<Regions>,
    ) { }

    private async getApplicant(userId: number): Promise<Applicants> {
        const applicant = await this.applicantsRepo.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile was not found.');
        }

        return applicant;
    }

    private async validateRegion(regionId: number): Promise<Regions> {
        const region = await this.regionsRepo.findOne({
            where: { id: regionId },
        });

        if (!region) {
            throw new NotFoundException(
                `Region with ID ${regionId} was not found.`,
            );
        }

        return region;
    }

    private async findOwnedAddress(
        id: number,
        applicantId: number,
    ): Promise<ApplicantAddresses> {
        const address = await this.addressesRepo.findOne({
            where: {
                id,
                applicant_id: applicantId,
            },
            relations: ['region', 'region.country'],
        });

        if (!address) {
            throw new NotFoundException(
                'Applicant address was not found.',
            );
        }

        return address;
    }

    private format(address: ApplicantAddresses) {
        return {
            id: address.id,
            applicant_id: address.applicant_id,

            region_id: address.region_id,
            region: address.region
                ? {
                    id: address.region.id,
                    name: address.region.region_name,
                    country: address.region.country
                        ? {
                            id: address.region.country.id,
                            name: address.region.country.name,
                        }
                        : null,
                }
                : null,

            sub_location: address.sub_location,
            postal: address.postal,
            created_at: address.created_at,
            updated_at: address.updated_at,
        };
    }

    async create(userId: number, dto: CreateApplicantAddressDto) {
        const applicant = await this.getApplicant(userId);
        const region = await this.validateRegion(dto.region_id);

        const address = this.addressesRepo.create({
            applicant_id: applicant.id,
            region_id: region.id,
            region,
            sub_location: dto.sub_location.trim(),
            postal: dto.postal.trim(),
        });

        const saved = await this.addressesRepo.save(address);
        const result = await this.findOwnedAddress(saved.id, applicant.id);

        return {
            success: true,
            message: 'Applicant address created successfully.',
            data: this.format(result),
        };
    }

    async findAll(userId: number) {
        const applicant = await this.getApplicant(userId);

        const addresses = await this.addressesRepo.find({
            where: { applicant_id: applicant.id },
            relations: {
                region: {
                    country: true,
                },
            },
            order: { id: 'DESC' },
        });

        return {
            success: true,
            message: 'Applicant addresses retrieved successfully.',
            data: addresses.map((address) => this.format(address)),
        };
    }

    async findOne(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);
        const address = await this.findOwnedAddress(id, applicant.id);

        return {
            success: true,
            data: this.format(address),
        };
    }

    async update(
        userId: number,
        addressId: number,
        dto: UpdateApplicantAddressDto,
    ) {
        const applicant = await this.getApplicant(userId);

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const address = await this.findOwnedAddress(
            addressId,
            applicant.id,
        );

        // Update applicant profile fields.
        const profileFields = [
            'first_name',
            'middle_name',
            'last_name',
            'gender_id',
            'marital_id',
            'dob',
            'nationality_id',
        ] as const;

        for (const field of profileFields) {
            if (dto[field] !== undefined) {
                (applicant as any)[field] = dto[field];
            }
        }

        // Update address fields.
        if (dto.region_id !== undefined && dto.region_id !== null) {
            await this.validateRegion(dto.region_id);
            address.region_id = dto.region_id;
        }

        if (dto.sub_location !== undefined) {
            address.sub_location = dto.sub_location;
        }

        if (dto.postal !== undefined) {
            address.postal = dto.postal;
        }

        // Update applicant, address, and phone in one transaction.
        const result = await this.applicantsRepo.manager.transaction(
            async (manager) => {
                await manager.save(applicant);

                address.updated_at = new Date();
                const savedAddress = await manager.save(address);

                let savedPhone: ApplicantPhones | null = null;

                if (
                    dto.phone_number !== undefined &&
                    dto.phone_number !== null
                ) {
                    const phoneRepo = manager.getRepository(ApplicantPhones);

                    // Find the latest phone record belonging to this applicant.
                    let phone = await phoneRepo.findOne({
                        where: {
                            applicant_id: applicant.id,
                        },
                        order: {
                            id: 'DESC',
                        },
                    });

                    if (phone) {
                        phone.phone_number = dto.phone_number;
                        phone.updated_at = new Date();
                    } else {
                        phone = phoneRepo.create({
                            applicant_id: applicant.id,
                            phone_number: dto.phone_number,
                        });
                    }

                    savedPhone = await phoneRepo.save(phone);
                }

                return {
                    address: savedAddress,
                    phone: savedPhone,
                };
            },
        );

        return {
            success: true,
            message: 'Applicant profile, address and phone updated successfully',
            data: {
                applicant,
                address: this.format(result.address),
                phone: result.phone
                    ? {
                        id: result.phone.id,
                        applicant_id: result.phone.applicant_id,
                        phone_number: result.phone.phone_number,
                        created_at: result.phone.created_at,
                        updated_at: result.phone.updated_at,
                    }
                    : null,
            },
        };
    }

    async remove(userId: number, id: number) {
        const applicant = await this.getApplicant(userId);
        const address = await this.findOwnedAddress(id, applicant.id);

        await this.addressesRepo.remove(address);

        return {
            success: true,
            message: 'Applicant address deleted successfully.',
        };
    }

    async updatePicture(
        userId: number,
        picture: string,
    ) {
        const applicant = await this.getApplicant(userId);

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile not found',
            );
        }

        applicant.picture = picture;

        await this.applicantsRepo.save(applicant);

        return {
            success: true,
            message: 'Applicant profile picture updated successfully',
            data: {
                applicant_id: applicant.id,
                picture: applicant.picture,
            },
        };
    }

    async updateBackgroundPicture(
        userId: number,
        backgroundPicture: string,
    ) {
        const applicant = await this.getApplicant(userId);

        if (!applicant) {
            throw new NotFoundException(
                'Applicant profile not found',
            );
        }

        applicant.background_picture = backgroundPicture;

        await this.applicantsRepo.save(applicant);

        return {
            success: true,
            message: 'Applicant background picture updated successfully',
            data: {
                applicant_id: applicant.id,
                background_picture: applicant.background_picture,
            },
        };
    }

    async basicInformation(userId: number) {
        const applicant = await this.getApplicant(userId);

        // Fetch all applicant addresses, including the full country entity
        const addresses = await this.addressesRepo.find({
            where: {
                applicant_id: applicant.id,
            },
            relations: {
                region: {
                    country: true,
                },
            },
            order: {
                id: 'DESC',
            },
        });

        // Fetch all phone numbers belonging to the applicant
        const phoneRepo =
            this.applicantsRepo.manager.getRepository(ApplicantPhones);

        const phones = await phoneRepo.find({
            where: {
                applicant_id: applicant.id,
            },
            order: {
                id: 'DESC',
            },
        });

        return {
            success: true,
            message: 'Applicant basic information retrieved successfully',
            data: {
                id: applicant.id,
                first_name: applicant.first_name,
                middle_name: applicant.middle_name,
                last_name: applicant.last_name,
                dob: applicant.dob,

                phone: phones.map((phone) => ({
                    id: phone.id,
                    phone_number: phone.phone_number,
                })),

                addresses: addresses.map((address) => ({
                    id: address.id,
                    sub_location: address.sub_location,
                    postal: address.postal,

                    region: address.region
                        ? {
                            id: address.region.id,
                            name: address.region.region_name,

                            // Return every country field from the countries table
                            country: address.region.country
                                ? {
                                    id: address.region.country.id,
                                    name: address.region.country.name,
                                    citizenship: address.region.country.citizenship,
                                    country_code: address.region.country.country_code,
                                    alpha_code: address.region.country.alpha_code,
                                    currency: address.region.country.currency,
                                    creator_id: address.region.country.creator_id,
                                    updator_id: address.region.country.updator_id,
                                    created_at: address.region.country.created_at,
                                    updated_at: address.region.country.updated_at,
                                    hide: address.region.country.hide,
                                }
                                : null,
                        }
                        : null,
                })),
            },
        };
    }
async updateBasicInformation(
    userId: number,
    dto: {
        first_name?: string;
        middle_name?: string | null;
        last_name?: string;
        dob?: string | Date | null;

        gender_id?: number;
        marital_status_id?: number;

        phone?: string;

        region_id?: number;
        sub_location?: string;
        postal?: string | null;
    },
) {
    const applicant = await this.getApplicant(userId);

    if (!applicant) {
        throw new NotFoundException('Applicant not found');
    }

    await this.applicantsRepo.manager.transaction(async (manager) => {
        const applicantRepo = manager.getRepository(Applicants);
        const phoneRepo = manager.getRepository(ApplicantPhones);
        const addressRepo = manager.getRepository(ApplicantAddresses);
        const regionRepo = manager.getRepository(Regions);
        const genderRepo = manager.getRepository(Genders);
        const maritalRepo = manager.getRepository(MaritalStatuses);

        // 1. UPDATE BASIC INFORMATION

        if (dto.first_name !== undefined) {
            applicant.first_name = dto.first_name;
        }

        if (dto.middle_name !== undefined) {
            applicant.middle_name = dto.middle_name;
        }

        if (dto.last_name !== undefined) {
            applicant.last_name = dto.last_name;
        }

        if (dto.dob !== undefined) {
            applicant.dob = dto.dob ? new Date(dto.dob) : null;
        }

        // 2. UPDATE GENDER

        if (dto.gender_id !== undefined) {
            const gender = await genderRepo.findOne({
                where: { id: dto.gender_id },
            });

            if (!gender) {
                throw new BadRequestException(
                    `Gender ${dto.gender_id} was not found`,
                );
            }

            applicant.gender_id = gender.id;
        }

        // 3. UPDATE MARITAL STATUS

        if (dto.marital_status_id !== undefined) {
            const marital = await maritalRepo.findOne({
                where: { id: dto.marital_status_id },
            });

            if (!marital) {
                throw new BadRequestException(
                    `Marital status ${dto.marital_status_id} was not found`,
                );
            }

            applicant.marital_id = marital.id;
        }

        await applicantRepo.save(applicant);

        // 4. UPDATE OR CREATE SINGLE PHONE NUMBER

        if (dto.phone !== undefined) {
            const existingPhone = await phoneRepo.findOne({
                where: {
                    applicant_id: applicant.id,
                },
                order: {
                    id: 'DESC',
                },
            });

            if (existingPhone) {
                existingPhone.phone_number = dto.phone;
                await phoneRepo.save(existingPhone);
            } else {
                await phoneRepo.save(
                    phoneRepo.create({
                        applicant_id: applicant.id,
                        phone_number: dto.phone,
                    }),
                );
            }
        }

        // 5. UPDATE OR CREATE APPLICANT ADDRESS

        if (
            dto.region_id !== undefined ||
            dto.sub_location !== undefined ||
            dto.postal !== undefined
        ) {
            const address = await addressRepo.findOne({
                where: {
                    applicant_id: applicant.id,
                },
                order: {
                    id: 'DESC',
                },
            });

            // Validate region
            if (dto.region_id !== undefined) {
                const region = await regionRepo.findOne({
                    where: { id: dto.region_id },
                });

                if (!region) {
                    throw new BadRequestException(
                        `Region ${dto.region_id} was not found`,
                    );
                }
            }

            if (address) {
                if (dto.region_id !== undefined) {
                    address.region_id = dto.region_id;
                }

                if (dto.sub_location !== undefined) {
                    address.sub_location = dto.sub_location;
                }

                if (dto.postal !== undefined) {
                    address.postal = dto.postal ?? '';
                }

                await addressRepo.save(address);
            } else {
                if (dto.region_id === undefined) {
                    throw new BadRequestException(
                        'region_id is required when creating an address',
                    );
                }

                await addressRepo.save(
                    addressRepo.create({
                        applicant_id: applicant.id,
                        region_id: dto.region_id,
                        sub_location: dto.sub_location ?? '',
                        postal: dto.postal ?? '',
                    }),
                );
            }
        }
    });

    // 6. RETURN UPDATED INFORMATION

    return this.basicInformation(userId);
}
}
