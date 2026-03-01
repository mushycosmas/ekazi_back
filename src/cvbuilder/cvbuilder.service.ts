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

  async getApplicantCv(applicantId: number) {
    // Date formatter helper
    const formatDate = (dateValue: any): string | null => {
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
    };

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
      .leftJoinAndSelect('applicant.applicant_trainings', 'training')
      .leftJoinAndSelect('address.region', 'addressRegion') // Join region for addresses
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
    // 3️⃣ Filter out null entries and clean the data
    // ---------------------
    const tools = (applicant.applicant_tools || [])
      .map(t => t.tools)
      .filter(tool => tool !== null);

    const software = (applicant.applicant_software || [])
      .map(s => s.software)
      .filter(software => software !== null);

    // ---------------------
    // 4️⃣ Build the final response object
    // ---------------------
    const data = {
      basic_info: {
        id: applicant.id,
        first_name: applicant.first_name,
        middle_name: applicant.middle_name,
        last_name: applicant.last_name,
        dob: formatDate(applicant.dob),
        nationality_id: applicant.nationality_id || null,
        picture: applicant.picture,
        background_picture: applicant.background_picture,
        marital_status: applicant.marital?.marital_status || null,
        gender: applicant.gender?.gender_name || null,
        email: applicant.user?.email || null,
      },
      
      // NEW: Add objective
      objective: applicant.applicant_objectives?.[0]?.objective || null,
      
      // NEW: Add addresses
      addresses: (applicant.applicant_addresses || []).map(address => ({
        id: address.id,
        region: address.region?.region_name || null,
        sub_location: address.sub_location,
        postal: address.postal
      })),
      
      phones: (applicant.applicant_phones || []).map(phone => ({
        id: phone.id,
        phone_number: phone.phone_number
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
      
      career_summary: applicant.applicant_career?.[0]?.career || null,
      
      skills: {
        tools: tools
          .filter(tool => tool && tool.hide === 0)
          .map(tool => tool.tool_name),
        knowledge: (applicant.applicant_knowledge || [])
          .map(k => k.knowledge)
          .filter(knowledge => knowledge && !knowledge.hide)
          .map(knowledge => knowledge.knowledge_name),
        software: software
          .filter(software => software && !software.hide)
          .map(software => software.software_name),
      },
      
      cultures: (applicant.applicant_cultures || [])
        .map(c => c.culture)
        .filter(culture => culture !== null)
        .map(culture => culture.culture_name),
      
      personalities: (applicant.applicant_personalities || [])
        .map(ap => ap.personality)
        .filter((personality): personality is NonNullable<typeof personality> => 
          personality !== null && personality !== undefined
        )
        .map(personality => ({
          id: personality.id,
          name: personality.personality_name
        })),
      
      proficiency: (applicant.applicant_proficiencies || []).map(prof => ({
        id: prof.id,
        proficiency_id: prof.proficiency_id,
        started: formatDate(prof.started),
        ended: formatDate(prof.ended),
        award: prof.award,
        attachment: prof.attachment
      })),
      
      education: (applicant.applicant_education || []).map(edu => ({
        id: edu.id,
        college_id: edu.college_id,
        course_id: edu.course_id,
        major_id: edu.major_id,
        education_level_id: edu.education_level_id,
        attachment: edu.attachment,
        started: formatDate(edu.started),
        ended: formatDate(edu.ended)
      })),
      trainings: (applicant.applicant_trainings || [])
        .filter(training => !training.hide) // Filter out hidden trainings
        .map(training => ({
          id: training.id,
          name: training.name,
          institution: training.institution,
          description: training.description,
          started: formatDate(training.started),
          ended: formatDate(training.ended),
          attachment: training.attachment
        })),
      positions: positions
        .filter(pos => pos !== null && pos !== undefined)
        .map(pos => ({
          id: pos.id,
          position: pos.position?.position_name || null,
          position_level: pos.position_level?.position_name || null,
          industry: pos.industry?.industry_name || null,
          employer: pos.applicant_employer?.employer_name || null,
          region: pos.region?.region_name || null,
          sub_location: pos.sub_location,
          responsibility: pos.responsibility,
          remark: pos.remark,
          start_date: formatDate(pos.start_date),
          end_date: formatDate(pos.end_date),
          start_salary: pos.start_salary?.low || null,
          end_salary: pos.end_salary?.high || null,
        })),
    };

    return data;
  }
}