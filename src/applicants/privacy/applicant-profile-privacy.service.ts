 import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantProfilePrivacy } from 'src/entities/applicants/applicant-profile-privacy.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { UpsertProfilePrivacyDto } from './dto/upsert-profile-privacy.dto';
import { SaveProfilePrivacyBulkDto } from './dto/save-profile-privacy-bulk.dto';

@Injectable()
export class ApplicantProfilePrivacyService {
  constructor(
    @InjectRepository(ApplicantProfilePrivacy)
    private readonly privacyRepository: Repository<ApplicantProfilePrivacy>,

    @InjectRepository(Applicants)
    private readonly applicantRepository: Repository<Applicants>,
  ) {}

  private async getApplicant(userId: number): Promise<Applicants> {
    const applicant = await this.applicantRepository.findOne({
      where: { user_id: userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found.');
    }

    return applicant;
  }

  // GET all privacy settings belonging to the authenticated applicant
  async findAll(userId: number) {
    const applicant = await this.getApplicant(userId);

    const settings = await this.privacyRepository.find({
      where: {
        applicant_id: applicant.id,
      },
      order: {
        status_id: 'ASC',
      },
    });

    return {
      success: true,
      message: 'Profile privacy settings retrieved successfully.',
      data: settings,
    };
  }

  // GET one setting by status_id
  async findOne(userId: number, statusId: number) {
    const applicant = await this.getApplicant(userId);

    const setting = await this.privacyRepository.findOne({
      where: {
        applicant_id: applicant.id,
        status_id: statusId,
      },
    });

    if (!setting) {
      throw new NotFoundException('Privacy setting not found.');
    }

    return {
      success: true,
      data: setting,
    };
  }

  // CREATE or UPDATE one setting
  async upsert(
    userId: number,
    dto: UpsertProfilePrivacyDto,
  ) {
    const applicant = await this.getApplicant(userId);

    if (dto.value !== 0 && dto.value !== 1) {
      throw new BadRequestException(
        'value must be 0 (hidden) or 1 (displayed).',
      );
    }

    let setting = await this.privacyRepository.findOne({
      where: {
        applicant_id: applicant.id,
        status_id: dto.status_id,
      },
    });

    if (!setting) {
      setting = this.privacyRepository.create({
        applicant_id: applicant.id,
        status_id: dto.status_id,
        value: dto.value,
      });
    } else {
      setting.value = dto.value;
    }

    const saved = await this.privacyRepository.save(setting);

    return {
      success: true,
      message: 'Profile privacy setting saved successfully.',
      data: saved,
    };
  }

  // SAVE multiple settings in one request
  async saveBulk(
    userId: number,
    dto: SaveProfilePrivacyBulkDto,
  ) {
    const applicant = await this.getApplicant(userId);

    const statusIds = dto.settings.map((item) => item.status_id);

    if (new Set(statusIds).size !== statusIds.length) {
      throw new BadRequestException(
        'Each status_id must appear only once in the request.',
      );
    }

    for (const item of dto.settings) {
      if (item.value !== 0 && item.value !== 1) {
        throw new BadRequestException(
          'Each value must be 0 (hidden) or 1 (displayed).',
        );
      }
    }

    const savedSettings = await this.privacyRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(ApplicantProfilePrivacy);
        const saved: ApplicantProfilePrivacy[] = [];

        for (const item of dto.settings) {
          let setting = await repository.findOne({
            where: {
              applicant_id: applicant.id,
              status_id: item.status_id,
            },
          });

          if (!setting) {
            setting = repository.create({
              applicant_id: applicant.id,
              status_id: item.status_id,
              value: item.value,
            });
          } else {
            setting.value = item.value;
          }

          saved.push(await repository.save(setting));
        }

        return saved;
      },
    );

    return {
      success: true,
      message: 'Profile privacy settings saved successfully.',
      data: savedSettings,
    };
  }

  // DELETE a setting
  async remove(userId: number, statusId: number) {
    const applicant = await this.getApplicant(userId);

    const setting = await this.privacyRepository.findOne({
      where: {
        applicant_id: applicant.id,
        status_id: statusId,
      },
    });

    if (!setting) {
      throw new NotFoundException('Privacy setting not found.');
    }

    await this.privacyRepository.remove(setting);

    return {
      success: true,
      message: 'Profile privacy setting deleted successfully.',
    };
  }
}