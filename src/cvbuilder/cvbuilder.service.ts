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
      .leftJoinAndSelect('applicant.applicant_personalities', 'personality', 'personality.applicant_id = applicant.id')
      .leftJoinAndSelect('applicant.applicant_software', 'applicantSoftware')
      .leftJoinAndSelect('applicantSoftware.software', 'software')
      .leftJoinAndSelect('applicant.applicant_proficiencies', 'proficiency')
      .leftJoinAndSelect('applicant.applicant_education', 'education')
      .where('applicant.id = :id', { id: applicantId })
      .getOne();

    if (!applicant) return null;

    // ---------------------
    // 2️⃣ Load applicant positions separately
    // ---------------------
    // const positions = await this.applicantPositionsRepo
    //   .createQueryBuilder('pos')
    //   .leftJoinAndSelect('pos.position', 'position')
    //   .leftJoinAndSelect('pos.position_level', 'position_level')
    //   .leftJoinAndSelect('pos.industry', 'industry')
    //   .leftJoinAndSelect('pos.region', 'region')
    //   .leftJoinAndSelect('pos.applicant_employer', 'employer')
    //   .leftJoinAndSelect('pos.start_salary', 'startSalary')
    //   .leftJoinAndSelect('pos.end_salary', 'endSalary')
    //   .where('pos.applicant_id = :id', { id: applicantId })
    //   .orderBy('pos.id', 'DESC')
    //   .getMany();

    // ---------------------
    // 3️⃣ Filter out null entries and clean the data
    // ---------------------
    const tools = (applicant.applicant_tools || [])
      .map(t => t.tools)
      .filter(tool => tool !== null);

    const software = (applicant.applicant_software || [])
      .map(s => ({
        id: s.id,
        software_id: s.software_id,
      }));

    // ---------------------
    // 4️⃣ Build the final response object matching the optimized structure
    // ---------------------
    const data = {
      basic_info: {
        id: applicant.id,
        first_name: applicant.first_name,
        middle_name: applicant.middle_name,
        last_name: applicant.last_name,
        dob: applicant.dob
        ? new Date(applicant.dob).toISOString().split('T')[0]
        : null,
        nationality_id: applicant.nationality_id || null,
        picture: applicant.picture,
        background_picture: applicant.background_picture,
        marital_status: applicant.marital?.marital_status || null,
        gender: applicant.gender?.gender_name || null,
        email: applicant.user?.email || null,
      },
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
        // Filter tools where hide = 0 (not hidden)
        tools: tools
          .filter(tool => tool && tool.hide === 0)
          .map(tool => tool.tool_name),
        // Filter knowledge where hide = 0 (not hidden)
        knowledge: (applicant.applicant_knowledge || [])
          .map(k => k.knowledge)
          .filter(knowledge => knowledge && !knowledge.hide)
          .map(knowledge => knowledge.knowledge_name),

          software: (applicant.applicant_software || [])
          .map(s => s.software)
          .filter(software => software && !software.hide)
          .map(software => software.software_name),
        // software: software.map(s => s.software_id)
      },
      cultures: (applicant.applicant_cultures || [])
        .map(c => c.culture)
        .filter(culture => culture !== null),
      personalities: applicant.applicant_personalities || [],
      proficiency: (applicant.applicant_proficiencies || []).map(prof => ({
        id: prof.id,
        proficiency_id: prof.proficiency_id,
        started: prof.started ? prof.started.toISOString().split('T')[0] : null,
        ended: prof.ended ? prof.ended.toISOString().split('T')[0] : null,
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
        started: edu.started ? edu.started.toISOString().split('T')[0] : null,
        ended: edu.ended ? edu.ended.toISOString().split('T')[0] : null
      })),
      // positions: positions || [],
    };

    return data;
  }
}