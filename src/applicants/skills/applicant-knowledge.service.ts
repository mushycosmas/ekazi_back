import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantKnowledge } from 'src/entities/applicants/applicant-knowledge.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Knowledge } from 'src/entities/knowledge.entity';

import { SaveApplicantKnowledgeDto } from './dto/save-applicant-knowledge.dto';

@Injectable()
export class ApplicantKnowledgeService {
  constructor(
    @InjectRepository(ApplicantKnowledge)
    private readonly applicantKnowledgeRepository: Repository<ApplicantKnowledge>,

    @InjectRepository(Applicants)
    private readonly applicantsRepository: Repository<Applicants>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Knowledge)
    private readonly knowledgeRepository: Repository<Knowledge>,
  ) {}

  // ============================================================
  // GET APPLICANT FROM CURRENT USER
  // ============================================================

  private async getApplicantByUserId(
    userId: number,
  ) {
    const applicant =
      await this.applicantsRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!applicant) {
      throw new NotFoundException(
        'Applicant profile not found for this user.',
      );
    }

    return applicant;
  }

  // ============================================================
  // NORMALIZE KNOWLEDGE NAME
  // ============================================================

  private normalizeKnowledgeName(
    name: string,
  ): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  // ============================================================
  // SAVE / UPDATE MULTIPLE KNOWLEDGE
  // ============================================================

  async saveKnowledge(
    userId: number,
    dto: SaveApplicantKnowledgeDto,
  ) {
    const applicant =
      await this.getApplicantByUserId(userId);

    if (
      !dto.knowledge ||
      dto.knowledge.length === 0
    ) {
      throw new ConflictException(
        'At least one knowledge is required.',
      );
    }

    // ==========================================================
    // 1. NORMALIZE AND REMOVE DUPLICATES
    // ==========================================================

    const uniqueKnowledgeNames = [
      ...new Set(
        dto.knowledge
          .map((knowledge) =>
            this.normalizeKnowledgeName(
              knowledge,
            ),
          )
          .filter(
            (knowledge) =>
              knowledge.length > 0,
          ),
      ),
    ];

    if (uniqueKnowledgeNames.length === 0) {
      throw new ConflictException(
        'At least one valid knowledge is required.',
      );
    }

    // ==========================================================
    // 2. DELETE ALL EXISTING KNOWLEDGE FOR APPLICANT
    // ==========================================================

    await this.applicantKnowledgeRepository.delete({
      applicant_id: applicant.id,
    });

    // ==========================================================
    // 3. PREPARE RESPONSE
    // ==========================================================

    const savedKnowledge: {
      id: number;
      knowledge_id: number;
      knowledge_name: string | null;
      created_at: Date | null;
      updated_at: Date | null;
    }[] = [];

    // ==========================================================
    // 4. ADD NEW KNOWLEDGE
    // ==========================================================

    for (
      const knowledgeName of uniqueKnowledgeNames
    ) {

      // --------------------------------------------------------
      // Check if knowledge already exists
      // --------------------------------------------------------

      let knowledge =
        await this.knowledgeRepository
          .createQueryBuilder('knowledge')
          .where(
            'LOWER(knowledge.knowledge_name) = LOWER(:knowledgeName)',
            {
              knowledgeName,
            },
          )
          .andWhere(
            'knowledge.hide = :hide',
            {
              hide: false,
            },
          )
          .getOne();

      // --------------------------------------------------------
      // Create global knowledge if it does not exist
      // --------------------------------------------------------

      if (!knowledge) {
        knowledge =
          this.knowledgeRepository.create({
            knowledge_name: knowledgeName,
            hide: false,
            creator_id: userId,
            updator_id: userId,
          });

        knowledge =
          await this.knowledgeRepository.save(
            knowledge,
          );
      }

      // --------------------------------------------------------
      // Create applicant/knowledge relationship
      // --------------------------------------------------------

      const applicantKnowledge =
        this.applicantKnowledgeRepository.create({
          applicant_id: applicant.id,
          knowledge_id: knowledge.id,
        });

      const saved =
        await this.applicantKnowledgeRepository.save(
          applicantKnowledge,
        );

      // --------------------------------------------------------
      // Response
      // --------------------------------------------------------

      savedKnowledge.push({
        id: saved.id,
        knowledge_id: knowledge.id,
        knowledge_name:
          knowledge.knowledge_name,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      });
    }

    return {
      status: true,
      message:
        'Applicant knowledge updated successfully.',
      data: savedKnowledge,
    };
  }

  // ============================================================
  // GET MY KNOWLEDGE
  // ============================================================

  async findAll(userId: number) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantKnowledge =
      await this.applicantKnowledgeRepository.find({
        where: {
          applicant_id: applicant.id,
        },
        relations: ['knowledge'],
        order: {
          id: 'DESC',
        },
      });

    const data = applicantKnowledge.map(
      (item) => ({
        id: item.id,

        knowledge: item.knowledge
          ? {
              id: item.knowledge.id,
              name:
                item.knowledge
                  .knowledge_name,
            }
          : null,

        created_at:
          item.created_at,

        updated_at:
          item.updated_at,
      }),
    );

    return {
      status: true,
      message:
        'Applicant knowledge retrieved successfully.',
      data,
    };
  }

  // ============================================================
  // GET ONE
  // ============================================================

  async findOne(
    userId: number,
    id: number,
  ) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantKnowledge =
      await this.applicantKnowledgeRepository.findOne({
        where: {
          id,
          applicant_id: applicant.id,
        },
        relations: ['knowledge'],
      });

    if (!applicantKnowledge) {
      throw new NotFoundException(
        'Applicant knowledge not found.',
      );
    }

    return {
      status: true,
      message:
        'Applicant knowledge retrieved successfully.',
      data: {
        id: applicantKnowledge.id,

        knowledge:
          applicantKnowledge.knowledge
            ? {
                id:
                  applicantKnowledge
                    .knowledge.id,

                name:
                  applicantKnowledge
                    .knowledge
                    .knowledge_name,
              }
            : null,

        created_at:
          applicantKnowledge.created_at,

        updated_at:
          applicantKnowledge.updated_at,
      },
    };
  }

  // ============================================================
  // DELETE KNOWLEDGE
  // ============================================================

  async remove(
    userId: number,
    id: number,
  ) {
    const applicant =
      await this.getApplicantByUserId(userId);

    const applicantKnowledge =
      await this.applicantKnowledgeRepository.findOne({
        where: {
          id,
          applicant_id: applicant.id,
        },
      });

    if (!applicantKnowledge) {
      throw new NotFoundException(
        'Applicant knowledge not found.',
      );
    }

    await this.applicantKnowledgeRepository.remove(
      applicantKnowledge,
    );

    return {
      status: true,
      message:
        'Applicant knowledge removed successfully.',
    };
  }
}