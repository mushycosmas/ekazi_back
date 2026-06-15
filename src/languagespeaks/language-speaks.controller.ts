import { Controller,Get } from '@nestjs/common';
import { LanguageSpeaksService } from './language-speaks.service';

@Controller('language-speaks')
export class LanguageSpeaksController {
      constructor(
    private readonly languageSpeaksService: LanguageSpeaksService,
  ) {}

  @Get()
  async findAll() {
    return this.languageSpeaksService.findAll();
  }
}
