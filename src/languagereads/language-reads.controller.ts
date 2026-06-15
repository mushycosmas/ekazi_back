import { Controller ,Get} from '@nestjs/common';
import { LanguagesReadsService } from './languages-reads.service';

@Controller('language-reads')
export class LanguageReadsController {
          constructor(
        private readonly languageReadsService: LanguagesReadsService,
      ) {}
    
      @Get()
      async findAll() {
        return this.languageReadsService.findAll();
      }
}
