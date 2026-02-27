import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Applicants)
    private readonly applicantsRepo: Repository<Applicants>,
  ) {}

  async getAllApplicants() {
    return await this.applicantsRepo.find({ relations: ['user', 'marital', 'gender'] });
  }
}