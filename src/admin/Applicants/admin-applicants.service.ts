import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clients } from 'src/client/clients.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AdminApplicantsService {
    constructor(
        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,
        private readonly dataSource: DataSource,


        @InjectRepository(ApplicantPositions)
        private readonly applicantPositionsRepo: Repository<ApplicantPositions>,
        @InjectRepository(ApplicantApplication)
        private readonly applicantApplicationRepository: Repository<ApplicantApplication>,
        @InjectRepository(ApplicantListing)
        private readonly applicantListingRepository: Repository<ApplicantListing>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,

        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,
    ) { }

    // Helper function to format position name (like ucwords in PHP)
    private formatPositionName(positionName: string): string | null {
        if (!positionName) return null;
        return positionName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    }

    // Method to get current position (matching PHP logic)
    private async getCurrentPosition(applicantId: number): Promise<string | null> {
        const now = new Date();

        const currentPosition = await this.applicantPositionsRepo
            .createQueryBuilder('pos')
            .leftJoinAndSelect('pos.position', 'position')
            .where('pos.applicant_id = :applicantId', { applicantId })
            .andWhere(
                '(pos.end_date IS NULL OR pos.end_date >= :now)',
                { now }
            )
            .orderBy(
                'CASE WHEN pos.end_date IS NULL THEN 0 ELSE 1 END',
                'ASC'
            )
            .addOrderBy(
                'CASE WHEN pos.start_date IS NULL THEN 1 ELSE 0 END',
                'ASC'
            )
            .addOrderBy('pos.start_date', 'DESC')
            .addOrderBy('pos.end_date', 'DESC')
            .getOne();

        if (currentPosition?.position?.position_name) {
            return this.formatPositionName(currentPosition.position.position_name);
        }
        return null;
    }

    // Date formatter helper
    private formatDate(dateValue: any): string | null {
        if (!dateValue) return null;

        try {
            if (dateValue instanceof Date) {
                const year = dateValue.getFullYear();
                const month = String(dateValue.getMonth() + 1).padStart(2, '0');
                const day = String(dateValue.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return null;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return null;
        }
    }
    async getApplicant(applicantId: number) {
        // ---------------------
        // 1️⃣ Load applicant main info + relations
        // ---------------------
        const applicant = await this.applicantsRepo
            .createQueryBuilder('applicant')
            .leftJoinAndSelect('applicant.user', 'user')
            .leftJoinAndSelect('applicant.marital', 'marital')
            .leftJoinAndSelect('applicant.gender', 'gender')
            .leftJoinAndSelect('applicant.applicant_career', 'career')
            .leftJoinAndSelect('applicant.applicant_tools', 'applicantTools')
            .leftJoinAndSelect('applicantTools.tools', 'tools')
            .leftJoinAndSelect('applicant.applicant_phones', 'phones')
            .leftJoinAndSelect('applicant.referees', 'referees')
            .leftJoinAndSelect('applicant.applicant_cultures', 'applicantCultures')
            .leftJoinAndSelect('applicantCultures.culture', 'culture')
            .leftJoinAndSelect('applicant.applicant_knowledge', 'applicantKnowledge')
            .leftJoinAndSelect('applicantKnowledge.knowledge', 'knowledge')
            .leftJoinAndSelect('applicant.applicant_personalities', 'personality')
            .leftJoinAndSelect('applicant.applicant_software', 'applicantSoftware')
            .leftJoinAndSelect('applicantSoftware.software', 'software')
            .leftJoinAndSelect('applicant.applicant_proficiencies', 'applicant_proficiencies')
            .leftJoinAndSelect('applicant_proficiencies.organization', 'organization')
            .leftJoinAndSelect('applicant_proficiencies.proficiency', 'proficiency')
            .leftJoinAndSelect('applicant.applicant_education', 'education')
            .leftJoinAndSelect('education.college', 'college')
            .leftJoinAndSelect('education.course', 'course')
            .leftJoinAndSelect('education.major', 'major')
            .leftJoinAndSelect('education.education_level', 'educationLevel')
            .leftJoinAndSelect('applicant.applicant_objectives', 'objective')
            .leftJoinAndSelect('applicant.applicant_addresses', 'address')
            .leftJoinAndSelect('address.region', 'addressRegion')
            .leftJoinAndSelect('applicant.applicant_trainings', 'training')
            .leftJoinAndSelect('applicant.applicant_languages', 'language')
            .leftJoinAndSelect('language.language', 'languageDetail')
            .leftJoinAndSelect('language.read', 'readLevel')
            .leftJoinAndSelect('language.write', 'writeLevel')
            .leftJoinAndSelect('language.speak', 'speakLevel')
            .leftJoinAndSelect('language.understand', 'understandLevel')
            .where('applicant.id = :id', { id: applicantId })
            .getOne();

        if (!applicant) return null;

        // ---------------------
        // 2️⃣ Load applicant positions separately with all relations
        // ---------------------
        const positions = await this.applicantPositionsRepo
            .createQueryBuilder('pos')
            .leftJoinAndSelect('pos.position', 'position')
            .leftJoinAndSelect('pos.position_level', 'position_level')
            .leftJoinAndSelect('pos.industry', 'industry')
            .leftJoinAndSelect('pos.region', 'region')
            .leftJoinAndSelect('pos.applicant_employer', 'employer')
            .leftJoinAndSelect('pos.start_salary', 'startSalary')
            .leftJoinAndSelect('pos.end_salary', 'endSalary')
            .where('pos.applicant_id = :id', { id: applicantId })
            .orderBy('pos.start_date', 'DESC')
            .getMany();

        // ---------------------
        // 3️⃣ Get current position using the custom logic
        // ---------------------
        const current_position = await this.getApplicantPosition(applicantId);

        // ---------------------
        // 4️⃣ Filter out null entries and clean the data
        // ---------------------
        const tools = (applicant.applicant_tools || [])
            .map(t => t.tools)
            .filter(tool => tool !== null);

        const software = (applicant.applicant_software || [])
            .map(s => s.software)
            .filter(software => software !== null);

        // ---------------------
        // 5️⃣ Build the final response object in CV profile order
        // ---------------------
        const data = {
            // =============================================
            // 1. BASIC INFORMATION
            // =============================================
            applicant_profile: {
                id: applicant.id,
                first_name: applicant.first_name,
                middle_name: applicant.middle_name,
                last_name: applicant.last_name,
                dob: this.formatDate(applicant.dob),
                nationality_id: applicant.nationality_id || null,
                picture: applicant.picture,
                background_picture: applicant.background_picture,
                email: applicant.user?.email || null,
                marital_status: applicant.marital?.marital_status || null,
                gender: applicant.gender?.gender_name || null,
            },

            // =============================================
            // 2. CONTACT INFORMATION
            // =============================================
            phone: (applicant.applicant_phones || []).map(phone => ({
                id: phone.id,
                phone_number: phone.phone_number
            })),

            address: (applicant.applicant_addresses || []).map(address => ({
                id: address.id,
                region: address.region?.region_name || null,
                sub_location: address.sub_location,
                postal: address.postal
            })),

            // =============================================
            // 3. CAREER OBJECTIVE & SUMMARY
            // =============================================
            objective: applicant.applicant_objectives?.[0]?.objective || null,
            career_summary: applicant.applicant_career?.[0]?.career || null,
            current_position: current_position,

            // =============================================
            // 4. WORK EXPERIENCE
            // =============================================
            experience: positions.map(pos => ({
                id: pos.id,
                position: pos.position?.position_name || null,
                position_level: pos.position_level?.position_name || null,
                industry: pos.industry?.industry_name || null,
                employer: pos.applicant_employer?.employer_name || null,
                region: pos.region?.region_name || null,
                sub_location: pos.sub_location,
                responsibility: pos.responsibility,
                remark: pos.remark,
                start_date: this.formatDate(pos.start_date),
                end_date: this.formatDate(pos.end_date),
                start_salary: pos.start_salary?.low || null,
                end_salary: pos.end_salary?.high || null,
            })),

            // =============================================
            // 5. EDUCATION
            // =============================================
            // education: (applicant.applicant_education || []).map(edu => ({
            //   id: edu.id,
            //   college_id: edu.college_id,
            //   course_id: edu.course_id,
            //   major_id: edu.major_id,
            //   education_level_id: edu.education_level_id,
            //   attachment: edu.attachment,
            //   started: this.formatDate(edu.started),
            //   ended: this.formatDate(edu.ended)
            // })),
            education: (applicant.applicant_education || []).map(edu => ({

                id: edu.id,


                college_id:
                    edu.college_id,

                college:
                    edu.college
                        ? {
                            id: edu.college.id,
                            name: edu.college.college_name,
                            town: edu.college.town,
                            registration: edu.college.reg
                        }
                        : null,
                course_id: edu.course_id,
                course: edu.course
                    ? {
                        id: edu.course.id,
                        name: edu.course.course_name
                    }
                    : null,
                major_id: edu.major_id,
                major: edu.major
                    ? {
                        id: edu.major.id,
                        name: edu.major.name
                    }
                    : null,
                education_level_id: edu.education_level_id,
                education_level: edu.education_level
                    ? {
                        id: edu.education_level.id,
                        name: edu.education_level.education_level
                    }
                    : null,
                attachment:
                    edu.attachment,


                started:
                    this.formatDate(
                        edu.started
                    ),


                ended:
                    this.formatDate(
                        edu.ended
                    )

            })),

            // =============================================
            // 6. TRAINING & CERTIFICATIONS
            // =============================================
            training: (applicant.applicant_trainings || [])
                .filter(training => !training.hide)
                .map(training => ({
                    id: training.id,
                    name: training.name,
                    institution: training.institution,
                    description: training.description,
                    started: this.formatDate(training.started),
                    ended: this.formatDate(training.ended),
                    attachment: training.attachment
                })),

            // =============================================
            // 7. SKILLS & PROFICIENCY
            // =============================================
            skills: {
                tools: tools
                    .filter(tool => tool && tool.hide === 0)
                    .map(tool => ({
                        id: tool.id,
                        name: tool.tool_name
                    })),

                knowledge: (applicant.applicant_knowledge || [])
                    .map(k => k.knowledge)
                    .filter(knowledge => knowledge && !knowledge.hide)
                    .map(knowledge => ({
                        id: knowledge.id,
                        name: knowledge.knowledge_name
                    })),

                software: software
                    .filter(software => software && !software.hide)
                    .map(software => ({
                        id: software.id,
                        name: software.software_name
                    })),
            },

            // =============================================
            // 8. LANGUAGE PROFICIENCY
            // =============================================
            language: (applicant.applicant_languages || []).map(lang => ({
                id: lang.id,
                language: lang.language?.language_name || null,
                read: lang.read?.read_ability || null,
                write: lang.write?.write_ability || null,
                speak: lang.speak?.speak_ability || null,
                understand: lang.understand?.understand_ability || null
            })),

            // =============================================
            // 9. CULTURAL & PERSONALITY TRAITS
            // =============================================
            culture: (applicant.applicant_cultures || [])
                .map(c => c.culture)
                .filter(culture => culture !== null)
                .map(culture => ({
                    id: culture.id,
                    name: culture.culture_name
                })),

            applicant_personality: (applicant.applicant_personalities || [])
                .map(ap => ap.personality)
                .filter((personality): personality is NonNullable<typeof personality> =>
                    personality !== null && personality !== undefined
                )
                .map(personality => ({
                    id: personality.id,
                    name: personality.personality_name
                })),

            // =============================================
            // 10. PROFESSIONAL PROFICIENCY
            // =============================================
            proficiency: (applicant.applicant_proficiencies || []).map(prof => ({
                id: prof.id,
                proficiency_id: prof.proficiency_id,
                proficiency: prof.proficiency
                    ? {
                        id: prof.proficiency.id,
                        name: prof.proficiency.proficiency_name,
                    }
                    : null,
                organization_id: prof.organization_id,
                organization: prof.organization
                    ? {
                        id: prof.organization.id,
                        name: prof.organization.organization_name,
                    }
                    : null,
                started: this.formatDate(prof.started),
                ended: this.formatDate(prof.ended),
                award: prof.award,
                attachment: prof.attachment,

            })),

            // =============================================
            // 11. REFERENCES
            // =============================================
            referees: (applicant.referees || []).map(referee => ({
                id: referee.id,
                first_name: referee.first_name,
                middle_name: referee.middle_name,
                last_name: referee.last_name,
                employer: referee.employer,
                position: referee.referee_position,
                email: referee.email,
                phone: referee.phone,
                type: referee.type
            })),
        };

        return {
            success: true,
            message: 'Applicant data retrieved successfully',
            data,
        };
    }
    async getJobseekers(
        page = 1,
        limit = 20,
        search?: string,
        position?: string,
        education_level_id?: number,
        industry_id?: number,
        position_level_id?: number,
    ) {
        const qb = this.applicantsRepo
            .createQueryBuilder('applicant')

            .select([
                'applicant.id',
                'applicant.first_name',
                'applicant.middle_name',
                'applicant.last_name',
                'applicant.picture',
                'applicant.background_picture',
                'applicant.created_at',

                'featuredSubscriptions.id',
                'featuredSubscriptions.verify',
            ])

            // Featured Subscription
            .leftJoin(
                'applicant.featuredPlanSubscriptions',
                'featuredSubscriptions',
            )

            // Education
            .leftJoin(
                'applicant.applicant_education',
                'education',
            )
            .leftJoin(
                'education.education_level',
                'educationLevel',
            )

            // Positions
            .leftJoin(
                'applicant.positions',
                'applicantPosition',
            )
            .leftJoin(
                'applicantPosition.position',
                'position',
            )

            // Profile completion counts
            .loadRelationCountAndMap(
                'applicant.phoneCount',
                'applicant.applicant_phones',
            )
            .loadRelationCountAndMap(
                'applicant.addressCount',
                'applicant.applicant_addresses',
            )
            .loadRelationCountAndMap(
                'applicant.educationCount',
                'applicant.applicant_education',
            )
            .loadRelationCountAndMap(
                'applicant.positionCount',
                'applicant.positions',
            )
            .loadRelationCountAndMap(
                'applicant.toolsCount',
                'applicant.applicant_tools',
            )
            .loadRelationCountAndMap(
                'applicant.softwareCount',
                'applicant.applicant_software',
            )
            .loadRelationCountAndMap(
                'applicant.knowledgeCount',
                'applicant.applicant_knowledge',
            )
            .loadRelationCountAndMap(
                'applicant.languageCount',
                'applicant.applicant_languages',
            )
            .loadRelationCountAndMap(
                'applicant.cultureCount',
                'applicant.applicant_cultures',
            )
            .loadRelationCountAndMap(
                'applicant.proficiencyCount',
                'applicant.applicant_proficiencies',
            )
            .loadRelationCountAndMap(
                'applicant.trainingCount',
                'applicant.applicant_trainings',
            )
            .loadRelationCountAndMap(
                'applicant.refereeCount',
                'applicant.referees',
            )
            .loadRelationCountAndMap(
                'applicant.careerCount',
                'applicant.applicant_career',
            )
            .loadRelationCountAndMap(
                'applicant.objectiveCount',
                'applicant.applicant_objectives',
            )

            // Base condition so optional filters can use andWhere()
            .where('1 = 1');

        // Search by applicant name
        if (search) {
            qb.andWhere(
                `
          (
            applicant.first_name LIKE :search
            OR applicant.middle_name LIKE :search
            OR applicant.last_name LIKE :search
          )
          `,
                {
                    search: `%${search}%`,
                },
            );
        }

        // Filter by position
        if (position) {
            qb.andWhere(
                `
          EXISTS (
            SELECT 1
            FROM applicant_positions ap
            INNER JOIN positions p
              ON p.id = ap.position_id
            WHERE ap.applicant_id = applicant.id
            AND p.position_name LIKE :position
          )
          `,
                {
                    position: `%${position}%`,
                },
            );
        }

        // Filter by education level
        if (education_level_id) {
            qb.andWhere(
                `
          EXISTS (
            SELECT 1
            FROM applicant_education ae
            WHERE ae.applicant_id = applicant.id
            AND ae.education_level_id = :educationLevelId
          )
          `,
                {
                    educationLevelId: education_level_id,
                },
            );
        }

        // Filter by industry
        if (industry_id) {
            qb.andWhere(
                `
          EXISTS (
            SELECT 1
            FROM applicant_positions ap
            WHERE ap.applicant_id = applicant.id
            AND ap.industry_id = :industryId
          )
          `,
                {
                    industryId: industry_id,
                },
            );
        }

        // Filter by position level
        if (position_level_id) {
            qb.andWhere(
                `
          EXISTS (
            SELECT 1
            FROM applicant_positions ap
            WHERE ap.applicant_id = applicant.id
            AND ap.position_level_id = :positionLevelId
          )
          `,
                {
                    positionLevelId: position_level_id,
                },
            );
        }

        qb.orderBy('applicant.created_at', 'DESC');

        const [applicants, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const data = await Promise.all(
            applicants.map(async (applicant) => {
                const applicant_position =
                    await this.getApplicantPosition(applicant.id);

                const profile_completion =
                    this.calculateProfileCompletion(applicant);

                // Remove internal counters
                delete (applicant as any).phoneCount;
                delete (applicant as any).addressCount;
                delete (applicant as any).educationCount;
                delete (applicant as any).positionCount;
                delete (applicant as any).toolsCount;
                delete (applicant as any).softwareCount;
                delete (applicant as any).knowledgeCount;
                delete (applicant as any).languageCount;
                delete (applicant as any).cultureCount;
                delete (applicant as any).proficiencyCount;
                delete (applicant as any).trainingCount;
                delete (applicant as any).refereeCount;
                delete (applicant as any).careerCount;
                delete (applicant as any).objectiveCount;

                return {
                    ...applicant,
                    applicant_position,
                    profile_completion,
                };
            }),
        );

        return {
            success: true,
            message: 'Jobseekers fetched successfully',
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    private calculateProfileCompletion(applicant: any) {

        const sections = {
            basic_information: 0,   // 15%
            contact_information: 0, // 10%
            career_summary: 0,      // 5%
            objective: 0,            // 5%
            education: 0,            // 15%
            experience: 0,           // 15%
            tools: 0,                // 5%
            software: 0,             // 5%
            knowledge: 0,            // 5%
            languages: 0,            // 5%
            culture: 0,              // 5%
            proficiency: 0,          // 3%
            training: 0,             // 2%
            referees: 0,             // 5%
        };


        // Basic Information 15%
        if (
            applicant.first_name &&
            applicant.last_name &&
            applicant.gender_id &&
            applicant.dob &&
            applicant.picture &&
            applicant.nationality_id
        ) {
            sections.basic_information = 15;
        }


        // Contact Information 10%
        if (
            applicant.phoneCount > 0 &&
            applicant.addressCount > 0
        ) {
            sections.contact_information = 10;
        }


        // Career Summary 5%
        if (applicant.careerCount > 0) {
            sections.career_summary = 5;
        }


        // Objective 5%
        if (applicant.objectiveCount > 0) {
            sections.objective = 5;
        }


        // Education 15%
        if (applicant.educationCount > 0) {
            sections.education = 15;
        }


        // Experience 15%
        if (applicant.positionCount > 0) {
            sections.experience = 15;
        }


        // Tools 5%
        if (applicant.toolsCount > 0) {
            sections.tools = 5;
        }


        // Software 5%
        if (applicant.softwareCount > 0) {
            sections.software = 5;
        }
        // Knowledge 5%
        if (applicant.knowledgeCount > 0) {
            sections.knowledge = 5;
        }
        // Languages 5%
        if (applicant.languageCount > 0) {
            sections.languages = 5;
        }
        // Culture 5%
        if (applicant.cultureCount > 0) {
            sections.culture = 5;
        }
        // Proficiency 5%
        if (applicant.proficiencyCount > 0) {
            sections.proficiency = 3;
        }
        // Training 2%
        if (applicant.trainingCount > 0) {
            sections.training = 2;
        }
        // Referees 3%
        if (applicant.refereeCount > 0) {
            sections.referees = 5;
        }
        const total_percentage = Object.values(sections)
            .reduce((sum, value) => sum + value, 0);


        return {
            total_percentage,
            sections,
        };
    }
    async getApplicantProfileCompletion(applicantId: number) {

        const applicant = await this.applicantsRepo
            .createQueryBuilder('applicant')

            .loadRelationCountAndMap(
                'applicant.phoneCount',
                'applicant.applicant_phones',
            )

            .loadRelationCountAndMap(
                'applicant.addressCount',
                'applicant.applicant_addresses',
            )

            .loadRelationCountAndMap(
                'applicant.educationCount',
                'applicant.applicant_education',
            )

            // FIXED
            .loadRelationCountAndMap(
                'applicant.positionCount',
                'applicant.positions',
            )

            .loadRelationCountAndMap(
                'applicant.toolsCount',
                'applicant.applicant_tools',
            )

            .loadRelationCountAndMap(
                'applicant.softwareCount',
                'applicant.applicant_software',
            )

            .loadRelationCountAndMap(
                'applicant.knowledgeCount',
                'applicant.applicant_knowledge',
            )

            .loadRelationCountAndMap(
                'applicant.languageCount',
                'applicant.applicant_languages',
            )

            .loadRelationCountAndMap(
                'applicant.trainingCount',
                'applicant.applicant_trainings',
            )
            .loadRelationCountAndMap(
                'applicant.cultureCount',
                'applicant.applicant_cultures',
            )

            .loadRelationCountAndMap(
                'applicant.proficiencyCount',
                'applicant.applicant_proficiencies',
            )

            .loadRelationCountAndMap(
                'applicant.refereeCount',
                'applicant.referees',
            )

            .loadRelationCountAndMap(
                'applicant.careerCount',
                'applicant.applicant_career',
            )

            .loadRelationCountAndMap(
                'applicant.objectiveCount',
                'applicant.applicant_objectives',
            )

            .where('applicant.id = :id', {
                id: applicantId,
            })

            .getOne();

        if (!applicant) {
            throw new NotFoundException('Applicant not found');
        }

        return {
            success: true,
            message: 'Profile completion retrieved successfully',
            data: {
                applicant_id: applicant.id,
                profile_completion: this.calculateProfileCompletion(applicant),
            },
        };
    }

    private async getApplicantPosition(
        applicantId: number,
    ): Promise<string | null> {

        const result = await this.applicantPositionsRepo
            .createQueryBuilder('ap')
            .innerJoin(
                'ap.position',
                'position'
            )
            .select(
                'position.position_name',
                'position_name'
            )
            .where(
                'ap.applicant_id = :applicantId',
                {
                    applicantId,
                },
            )

            // latest applicant experience
            .orderBy(
                'ap.start_date',
                'DESC'
            )
            .limit(1)

            .getRawOne();


        return result?.position_name ?? null;
    }

    async getClientApplicants(
        page: number = 1,
        limit: number = 20,
        search?: string,
        position?: string,
        education_level_id?: number,
        industry_id?: number,
        position_level_id?: number,
    ) {
        try {
            // ==========================
            // VALIDATE PAGINATION
            // ==========================

            page = Number(page);
            limit = Number(limit);

            if (!Number.isFinite(page) || page < 1) {
                page = 1;
            }

            if (!Number.isFinite(limit) || limit < 1) {
                limit = 20;
            }

            limit = Math.min(limit, 100);

            // ==========================
            // VALIDATE FILTER IDs
            // ==========================

            if (
                education_level_id !== undefined &&
                (!Number.isFinite(Number(education_level_id)) ||
                    Number(education_level_id) <= 0)
            ) {
                education_level_id = undefined;
            }

            if (
                industry_id !== undefined &&
                (!Number.isFinite(Number(industry_id)) ||
                    Number(industry_id) <= 0)
            ) {
                industry_id = undefined;
            }

            if (
                position_level_id !== undefined &&
                (!Number.isFinite(Number(position_level_id)) ||
                    Number(position_level_id) <= 0)
            ) {
                position_level_id = undefined;
            }

            const qb = this.applicantsRepo
                .createQueryBuilder('applicant')

                .select([
                    'applicant.id',
                    'applicant.first_name',
                    'applicant.middle_name',
                    'applicant.last_name',
                    'applicant.picture',
                    'applicant.background_picture',
                    'applicant.created_at',

                    'featuredSubscriptions.id',
                    'featuredSubscriptions.verify',
                ])

                .leftJoin(
                    'applicant.featuredPlanSubscriptions',
                    'featuredSubscriptions',
                )

                .leftJoin(
                    'applicant.applicant_education',
                    'education',
                )

                .leftJoin(
                    'education.education_level',
                    'educationLevel',
                )

                .leftJoin(
                    'applicant.positions',
                    'applicantPosition',
                )

                .leftJoin(
                    'applicantPosition.position',
                    'position',
                )

                // ==========================
                // PROFILE COMPLETION COUNTS
                // ==========================

                .loadRelationCountAndMap(
                    'applicant.phoneCount',
                    'applicant.applicant_phones',
                )

                .loadRelationCountAndMap(
                    'applicant.addressCount',
                    'applicant.applicant_addresses',
                )

                .loadRelationCountAndMap(
                    'applicant.educationCount',
                    'applicant.applicant_education',
                )

                .loadRelationCountAndMap(
                    'applicant.positionCount',
                    'applicant.positions',
                )

                .loadRelationCountAndMap(
                    'applicant.toolsCount',
                    'applicant.applicant_tools',
                )

                .loadRelationCountAndMap(
                    'applicant.softwareCount',
                    'applicant.applicant_software',
                )

                .loadRelationCountAndMap(
                    'applicant.knowledgeCount',
                    'applicant.applicant_knowledge',
                )

                .loadRelationCountAndMap(
                    'applicant.languageCount',
                    'applicant.applicant_languages',
                )

                .loadRelationCountAndMap(
                    'applicant.cultureCount',
                    'applicant.applicant_cultures',
                )

                .loadRelationCountAndMap(
                    'applicant.proficiencyCount',
                    'applicant.applicant_proficiencies',
                )

                .loadRelationCountAndMap(
                    'applicant.trainingCount',
                    'applicant.applicant_trainings',
                )

                .loadRelationCountAndMap(
                    'applicant.refereeCount',
                    'applicant.referees',
                )

                .loadRelationCountAndMap(
                    'applicant.careerCount',
                    'applicant.applicant_career',
                )

                .loadRelationCountAndMap(
                    'applicant.objectiveCount',
                    'applicant.applicant_objectives',
                );

            // ==========================
            // SEARCH
            // ==========================

            if (search?.trim()) {
                qb.andWhere(
                    `
                (
                    applicant.first_name LIKE :search
                    OR applicant.middle_name LIKE :search
                    OR applicant.last_name LIKE :search
                )
                `,
                    {
                        search: `%${search.trim()}%`,
                    },
                );
            }

            // ==========================
            // POSITION FILTER
            // ==========================

            if (position?.trim()) {
                qb.andWhere(
                    `
                EXISTS (
                    SELECT 1
                    FROM applicant_positions ap
                    INNER JOIN positions p
                        ON p.id = ap.position_id
                    WHERE ap.applicant_id = applicant.id
                    AND p.position_name LIKE :position
                )
                `,
                    {
                        position: `%${position.trim()}%`,
                    },
                );
            }

            // ==========================
            // EDUCATION FILTER
            // ==========================

            if (education_level_id !== undefined) {
                qb.andWhere(
                    `
                EXISTS (
                    SELECT 1
                    FROM applicant_education ae
                    WHERE ae.applicant_id = applicant.id
                    AND ae.education_level_id = :educationLevelId
                )
                `,
                    {
                        educationLevelId: Number(
                            education_level_id,
                        ),
                    },
                );
            }

            // ==========================
            // INDUSTRY FILTER
            // ==========================

            if (industry_id !== undefined) {
                qb.andWhere(
                    `
                EXISTS (
                    SELECT 1
                    FROM applicant_positions ap
                    WHERE ap.applicant_id = applicant.id
                    AND ap.industry_id = :industryId
                )
                `,
                    {
                        industryId: Number(industry_id),
                    },
                );
            }

            // ==========================
            // POSITION LEVEL FILTER
            // ==========================

            if (position_level_id !== undefined) {
                qb.andWhere(
                    `
                EXISTS (
                    SELECT 1
                    FROM applicant_positions ap
                    WHERE ap.applicant_id = applicant.id
                    AND ap.position_level_id = :positionLevelId
                )
                `,
                    {
                        positionLevelId: Number(
                            position_level_id,
                        ),
                    },
                );
            }

            // ==========================
            // ORDER
            // ==========================

            qb.orderBy(
                'applicant.created_at',
                'DESC',
            );

            // ==========================
            // PAGINATION
            // ==========================

            const [applicants, total] = await qb
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            // ==========================
            // FORMAT
            // ==========================

            const data = await Promise.all(
                applicants.map(async (applicant) => {

                    const applicant_position =
                        await this.getApplicantPosition(
                            applicant.id,
                        );

                    const profile_completion =
                        this.calculateProfileCompletion(
                            applicant,
                        );

                    delete (applicant as any).phoneCount;
                    delete (applicant as any).addressCount;
                    delete (applicant as any).educationCount;
                    delete (applicant as any).positionCount;
                    delete (applicant as any).toolsCount;
                    delete (applicant as any).softwareCount;
                    delete (applicant as any).knowledgeCount;
                    delete (applicant as any).languageCount;
                    delete (applicant as any).cultureCount;
                    delete (applicant as any).proficiencyCount;
                    delete (applicant as any).trainingCount;
                    delete (applicant as any).refereeCount;
                    delete (applicant as any).careerCount;
                    delete (applicant as any).objectiveCount;

                    return {
                        ...applicant,
                        applicant_position,
                        profile_completion,
                    };
                }),
            );

            return {
                success: true,
                message: 'Applicants fetched successfully',

                data,

                total,
                page,
                limit,

                totalPages: Math.ceil(
                    total / limit,
                ),
            };

        } catch (error) {

            console.error(
                'getClientApplicants error:',
                error,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch applicants',
                error: error.message,
            });
        }
    }
}
