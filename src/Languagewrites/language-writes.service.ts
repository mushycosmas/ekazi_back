import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    Repository,
} from 'typeorm';

import { CreateLanguageWriteDto } from './dto/create-language-write.dto';
import { UpdateLanguageWriteDto } from './dto/update-language-write.dto';
import { LanguageWrites } from 'src/entities/language-writes.entity';


@Injectable()
export class LanguageWritesService {


    constructor(

        @InjectRepository(LanguageWrites)
        private readonly repository:
            Repository<LanguageWrites>,

    ) { }



    // ==========================
    // CREATE
    // ==========================

    async create(
        dto: CreateLanguageWriteDto,
    ) {

        const language =
            this.repository.create(dto);


        return await this.repository.save(
            language,
        );

    }



    // ==========================
    // FIND ALL
    // ==========================

    async findAll() {
        const languageWrites = await this.repository.find({
            select: {
                id: true,
                write_ability: true,
            },
            where: {
                hide: false,
            },
            order: {
                write_ability: 'DESC',
            },
        });

        return {
            success: true,
            message: 'Language writes fetched successfully.',
            data: languageWrites,
        };
    }
    // ==========================
    // FIND ONE
    // ==========================

async findOne(id: number) {

    const language =
        await this.repository.findOne({

            select: {
                id: true,
                write_ability: true,
                hide: true,
            },

            where: {
                id,
                hide: false,
            },

        });


    if (!language) {

        throw new NotFoundException(
            'Language write not found',
        );

    }


    return language;

}

    // ==========================
    // UPDATE
    // ==========================

async update(
    id: number,
    dto: UpdateLanguageWriteDto,
) {

    const language =
        await this.findOne(id);


    Object.assign(
        language,
        dto,
    );


    const updated =
        await this.repository.save(language);


    return {
        success: true,
        message: 'Language write updated successfully.',
        data: updated,
    };

}

    // ==========================
    // SOFT DELETE
    // ==========================

async remove(
    id: number,
) {

    const language =
        await this.findOne(id);


    language.hide = true;


    const deleted =
        await this.repository.save(language);


    return {
        success: true,
        message: 'Language write deleted successfully.',
        data: deleted,
    };

}



}