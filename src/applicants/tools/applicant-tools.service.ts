import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { Tools } from 'src/entities/tools.entity';
import { Users } from 'src/entities/users.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantTools } from 'src/entities/applicants/applicant-tools.entity';

import { SaveApplicantToolsDto } from './dto/save-applicant-tools.dto';

@Injectable()
export class ApplicantToolsService {
    constructor(
        @InjectRepository(ApplicantTools)
        private readonly applicantToolsRepository: Repository<ApplicantTools>,

        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Tools)
        private readonly toolsRepository: Repository<Tools>,
    ) { }

    // ============================================================
    // GET APPLICANT FROM CURRENT USER
    // ============================================================

    private async getApplicantByUserId(userId: number) {
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
    // NORMALIZE TOOL NAME
    // ============================================================

    private normalizeToolName(name: string): string {
        return name
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase(),
            );
    }

    // ============================================================
    // SAVE / UPDATE MULTIPLE TOOLS
    // ============================================================

    async saveTools(
        userId: number,
        dto: SaveApplicantToolsDto,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        if (!dto.tools || dto.tools.length === 0) {
            throw new ConflictException(
                'At least one tool is required.',
            );
        }

        // ============================================================
        // 1. NORMALIZE AND REMOVE DUPLICATES
        // ============================================================

        const uniqueToolNames = [
            ...new Set(
                dto.tools
                    .map((tool) =>
                        this.normalizeToolName(tool),
                    )
                    .filter((tool) => tool.length > 0),
            ),
        ];

        if (uniqueToolNames.length === 0) {
            throw new ConflictException(
                'At least one valid tool is required.',
            );
        }

        // ============================================================
        // 2. DELETE ALL EXISTING TOOLS FOR THIS APPLICANT
        // ============================================================

        await this.applicantToolsRepository.delete({
            applicant_id: applicant.id,
        });

        // ============================================================
        // 3. PREPARE RESPONSE
        // ============================================================

        const savedTools: {
            id: number;
            tool_id: number;
            tool_name: string | null;
            hide: number;
            created_at: Date | null;
            updated_at: Date | null;
        }[] = [];

        // ============================================================
        // 4. ADD NEW TOOLS
        // ============================================================

        for (const toolName of uniqueToolNames) {

            // ----------------------------------------------------------
            // Check if tool already exists globally
            // ----------------------------------------------------------

            let tool =
                await this.toolsRepository
                    .createQueryBuilder('tool')
                    .where(
                        'LOWER(tool.tool_name) = LOWER(:toolName)',
                        {
                            toolName,
                        },
                    )
                    .andWhere(
                        'tool.deleted_at IS NULL',
                    )
                    .getOne();

            // ----------------------------------------------------------
            // Create global tool if it doesn't exist
            // ----------------------------------------------------------

            if (!tool) {
                tool =
                    this.toolsRepository.create({
                        tool_name: toolName,
                        hide: 0,
                        creator_id: userId,
                        updator_id: userId,
                        deleted_at: null,
                    });

                tool =
                    await this.toolsRepository.save(tool);
            }

            // ----------------------------------------------------------
            // Create applicant/tool relationship
            // ----------------------------------------------------------

            const applicantTool =
                this.applicantToolsRepository.create({
                    applicant_id: applicant.id,
                    tool_id: tool.id,
                    hide: 0,
                });

            const saved =
                await this.applicantToolsRepository.save(
                    applicantTool,
                );

            // ----------------------------------------------------------
            // Add to response
            // ----------------------------------------------------------

            savedTools.push({
                id: saved.id,
                tool_id: tool.id,
                tool_name: tool.tool_name,
                hide: saved.hide,
                created_at: saved.created_at,
                updated_at: saved.updated_at,
            });
        }

        return {
            status: true,
            message: 'Applicant tools updated successfully.',
            data: savedTools,
        };
    }

    // ============================================================
    // GET MY TOOLS
    // ============================================================

    async findAll(userId: number) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantTools =
            await this.applicantToolsRepository.find({
                where: {
                    applicant_id: applicant.id,
                    hide: 0,
                },
                relations: ['tools'],
                order: {
                    id: 'DESC',
                },
            });

        const data = applicantTools.map(
            (applicantTool) => ({
                id: applicantTool.id,

                tool: applicantTool.tools
                    ? {
                        id: applicantTool.tools.id,
                        name: applicantTool.tools.tool_name,
                    }
                    : null,

                hide: applicantTool.hide,

                created_at:
                    applicantTool.created_at,

                updated_at:
                    applicantTool.updated_at,
            }),
        );

        return {
            status: true,
            message:
                'Applicant tools retrieved successfully.',
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

        const applicantTool =
            await this.applicantToolsRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
                relations: ['tools'],
            });

        if (!applicantTool) {
            throw new NotFoundException(
                'Applicant tool not found.',
            );
        }

        return {
            status: true,
            message:
                'Applicant tool retrieved successfully.',
            data: {
                id: applicantTool.id,

                tool: applicantTool.tools
                    ? {
                        id: applicantTool.tools.id,
                        name: applicantTool.tools.tool_name,
                    }
                    : null,

                hide: applicantTool.hide,

                created_at:
                    applicantTool.created_at,

                updated_at:
                    applicantTool.updated_at,
            },
        };
    }

    // ============================================================
    // DELETE / REMOVE TOOL
    // ============================================================

    async remove(
        userId: number,
        id: number,
    ) {
        const applicant =
            await this.getApplicantByUserId(userId);

        const applicantTool =
            await this.applicantToolsRepository.findOne({
                where: {
                    id,
                    applicant_id: applicant.id,
                },
            });

        if (!applicantTool) {
            throw new NotFoundException(
                'Applicant tool not found.',
            );
        }

        // Soft remove from applicant profile
        applicantTool.hide = 1;

        await this.applicantToolsRepository.save(
            applicantTool,
        );

        return {
            status: true,
            message:
                'Applicant tool removed successfully.',
        };
    }
}