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

    ) {}



    // ==========================
    // CREATE
    // ==========================

    async create(
        dto: CreateLanguageWriteDto,
    ) {

        const language =
            this.repository.create(dto);


        const saved =
            await this.repository.save(language);


        return {
            success: true,
            message: 'Language write created successfully.',
            data: {
                id: saved.id,
                name: saved.write_ability,
            },
        };

    }



    // ==========================
    // FIND ENTITY (PRIVATE)
    // ==========================

    private async findLanguageEntity(
        id: number,
    ): Promise<LanguageWrites> {


        const language =
            await this.repository.findOne({

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
    // FIND ALL
    // ==========================

    async findAll() {


        const languageWrites =
            await this.repository.find({

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



        const data =
            languageWrites.map(language => ({

                id: language.id,

                name: language.write_ability,

            }));



        return {

            success: true,

            message:
                'Language writes fetched successfully.',

            data,

        };

    }



    // ==========================
    // FIND ONE
    // ==========================

    async findOne(
        id: number,
    ) {


        const language =
            await this.findLanguageEntity(id);



        return {

            success: true,

            message:
                'Language write fetched successfully.',

            data: {

                id: language.id,

                name:
                    language.write_ability,

            },

        };

    }



    // ==========================
    // UPDATE
    // ==========================

    async update(

        id: number,

        dto: UpdateLanguageWriteDto,

    ) {


        const language =
            await this.findLanguageEntity(id);



        Object.assign(

            language,

            dto,

        );



        const updated =
            await this.repository.save(language);



        return {

            success: true,

            message:
                'Language write updated successfully.',

            data: {

                id: updated.id,

                name:
                    updated.write_ability,

            },

        };

    }



    // ==========================
    // SOFT DELETE
    // ==========================

    async remove(

        id: number,

    ) {


        const language =
            await this.findLanguageEntity(id);



        language.hide = true;



        await this.repository.save(language);



        return {

            success: true,

            message:
                'Language write deleted successfully.',

        };

    }


}