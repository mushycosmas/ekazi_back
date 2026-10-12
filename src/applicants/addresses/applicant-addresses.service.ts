
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantAddresses } from 'src/entities/applicants/applicant-addresses.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Regions } from 'src/entities/regions.entity';

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

        // Update applicant profile fields only when provided.
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

        // Update address fields only when provided.
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

        // Save both updates in a transaction.
        await this.applicantsRepo.manager.transaction(async (manager) => {
            await manager.save(applicant);
            address.updated_at = new Date();
            await manager.save(address);
        });

        return {
            success: true,
            message: 'Applicant profile and address updated successfully',
            data: {
                applicant,
                address: this.format(address),
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
}
