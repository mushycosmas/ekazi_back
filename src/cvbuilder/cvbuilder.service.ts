// src/cvbuilder/cvbuilder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';

@Injectable()
export class CvbuilderService {
  constructor(
    @InjectRepository(Applicants)
    private readonly applicantsRepo: Repository<Applicants>,

    @InjectRepository(ApplicantPositions)
    private readonly applicantPositionsRepo: Repository<ApplicantPositions>,
  ) {}

  // Helper function to format position name (like ucwords in PHP)
  private formatPositionName(positionName: string): string | null {
    if (!positionName) return null;
    // Convert to lowercase then uppercase first letter of each word
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
        // Custom ordering: NULL end_date first (CASE WHEN end_date IS NULL THEN 0 ELSE 1 END)
        'CASE WHEN pos.end_date IS NULL THEN 0 ELSE 1 END',
        'ASC'
      )
      .addOrderBy(
        // Handle null start_date (put them last)
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

  async getApplicantCv(applicantId: number) {
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
      .leftJoinAndSelect('applicant.applicant_proficiencies', 'proficiency')
      .leftJoinAndSelect('applicant.applicant_education', 'education')
      .leftJoinAndSelect('applicant.applicant_objectives', 'objective')
      .leftJoinAndSelect('applicant.applicant_addresses', 'address')
      .leftJoinAndSelect('address.region', 'addressRegion')
      .leftJoinAndSelect('applicant.applicant_trainings', 'training')
      .leftJoinAndSelect('applicant.applicant_languages', 'language')
      .leftJoinAndSelect('language.language', 'languageDetail')
      // ADD THESE LINES to load the ability relations
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
    const current_position = await this.getCurrentPosition(applicantId);

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
    // 5️⃣ Build the final response object
    // ---------------------
    const data = {
      // Top-level fields
      address: (applicant.applicant_addresses || []).map(address => ({
        id: address.id,
        region: address.region?.region_name || null,
        sub_location: address.sub_location,
        postal: address.postal
      })),
      
      phone: (applicant.applicant_phones || []).map(phone => ({
        id: phone.id,
        phone_number: phone.phone_number
      })),
      
      objective: applicant.applicant_objectives?.[0]?.objective || null,
      
      education: (applicant.applicant_education || []).map(edu => ({
        id: edu.id,
        college_id: edu.college_id,
        course_id: edu.course_id,
        major_id: edu.major_id,
        education_level_id: edu.education_level_id,
        attachment: edu.attachment,
        started: this.formatDate(edu.started),
        ended: this.formatDate(edu.ended)
      })),
      
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
      
      experience: positions.map(pos => ({
        id: pos.id,
        position: pos.position?.position_name || null,
        position_level: pos.position_level?.position_name || null, // Fixed: was position_name
        industry: pos.industry?.industry_name || null,
        employer: pos.applicant_employer?.employer_name || null,
        region: pos.region?.region_name || null,
        sub_location: pos.sub_location,
        responsibility: pos.responsibility,
        remark: pos.remark,
        start_date: this.formatDate(pos.start_date),
        end_date: this.formatDate(pos.end_date),
        start_salary: pos.start_salary?.low || null, // Fixed: was .low
        end_salary: pos.end_salary?.high || null,     // Fixed: was .high
      })),
      
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
      
      language: (applicant.applicant_languages || []).map(lang => ({
        id: lang.id,
        language: lang.language?.language_name || null,
        read: lang.read?.read_ability || null,
        write: lang.write?.write_ability || null,
        speak: lang.speak?.speak_ability || null,
        understand: lang.understand?.understand_ability || null
      })),
      
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
      },
      
      // Formatted like proficiency - objects with id and name
      culture: (applicant.applicant_cultures || [])
        .map(c => c.culture)
        .filter(culture => culture !== null)
        .map(culture => ({
          id: culture.id,
          name: culture.culture_name
        })),
      
      tools: tools
        .filter(tool => tool && tool.hide === 0)
        .map(tool => ({
          id: tool.id,
          name: tool.tool_name
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
      
      // Proficiency - already in correct format
      proficiency: (applicant.applicant_proficiencies || []).map(prof => ({
        id: prof.id,
        proficiency_id: prof.proficiency_id,
        started: this.formatDate(prof.started),
        ended: this.formatDate(prof.ended),
        award: prof.award,
        attachment: prof.attachment
      })),
      
      careers: applicant.applicant_career?.[0]?.career || null,
      
      marital_status: applicant.marital?.marital_status || null,
      
      current_position: current_position,
    };

    return data;
  }
}