
import {
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
}
