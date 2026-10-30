import {
    NestFactory,
} from '@nestjs/core';

import {
    AppModule,
} from './app.module';
import {
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
 

import {
    join,
} from 'path';

import {
    NestExpressApplication,
} from '@nestjs/platform-express';


async function bootstrap() {

    const app =
        await NestFactory.create<NestExpressApplication>(
            AppModule,
            {
                rawBody: true,
            },
        );


    app.setGlobalPrefix(
        'api',
    );


    app.enableCors({

        origin: [

            'https://recruitment.ekazi.co.tz',

            'https://ekazi.co.tz',

            'http://localhost:3000',
            
            'https://test.ekazi.co.tz',

        ],

        methods: [

            'GET',

            'HEAD',

            'PUT',

            'PATCH',

            'POST',

            'DELETE',

            'OPTIONS',

        ],

        allowedHeaders: [

            'Content-Type',

            'Authorization',

            'Accept',

        ],

        credentials:
            true,

    });


    app.useStaticAssets(

        join(
            __dirname,
            '..',
            'uploads',
        ),

        {

            prefix:
                '/uploads/',

        },

    );


    // app.useGlobalPipes(

    //     new ValidationPipe({

    //         whitelist:
    //             true,

    //         forbidNonWhitelisted:
    //             true,

    //         transform:
    //             true,

    //     }),

    // );
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,

            exceptionFactory: (errors) => {
                console.error(
                    '\n========== DTO VALIDATION ERRORS ==========',
                );

                console.error(
                    JSON.stringify(
                        errors.map((error) => ({
                            property: error.property,
                            receivedValue: error.value,
                            receivedType: typeof error.value,
                            constraints: error.constraints,
                        })),
                        null,
                        2,
                    ),
                );

                console.error(
                    '===========================================\n',
                );

                return new BadRequestException(
                    errors.map((error) => ({
                        property: error.property,
                        value: error.value,
                        constraints: error.constraints,
                    })),
                );
            },
        }),
    );


    const port =
        process.env.PORT || 3011;


    console.log(
        'PAYMENT_PROVIDER:',
        process.env.PAYMENT_PROVIDER,
    );

    console.log(
        'SNIPPE_API_KEY configured:',
        !!process.env.SNIPPE_API_KEY,
    );


    await app.listen(
        port,
    );


    console.log(
        `Server running on port ${port}`,
    );

}


bootstrap();