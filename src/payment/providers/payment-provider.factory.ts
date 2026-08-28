// import {
//     Injectable,
//     InternalServerErrorException,
// } from '@nestjs/common';

// import {
//     ConfigService,
// } from '@nestjs/config';

// import {
//     PaymentProvider,
// } from '../interfaces/payment-provider.interface';

// import {
//     SelcomPaymentProvider,
// } from './selcom-payment.provider';

// import {
//     SnippePaymentProvider,
// } from './snippe-payment.provider';


// @Injectable()
// export class PaymentProviderFactory {


//     constructor(

//         private readonly configService:
//             ConfigService,

//         private readonly selcomProvider:
//             SelcomPaymentProvider,

//         private readonly snippeProvider:
//             SnippePaymentProvider,

//     ) {}


//     getProvider():
//         PaymentProvider {


//         const provider =
//             this.getProviderName();


//         switch (
//             provider
//         ) {

//             case 'selcom':

//                 return this.selcomProvider;


//             case 'snippe':

//                 return this.snippeProvider;


//             default:

//                 throw new InternalServerErrorException(

//                     `Unsupported payment provider: ${provider}`,

//                 );

//         }

//     }


//     getProviderName():
//         string {


//         return (

//             this.configService.get<string>(
//                 'PAYMENT_PROVIDER',
//                 'snippe',
//             )

//             .trim()

//             .toLowerCase()

//         );

//     }

// }

import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import {
    PaymentProvider,
} from '../interfaces/payment-provider.interface';

import {
    SelcomPaymentProvider,
} from './selcom-payment.provider';

import {
    SnippePaymentProvider,
} from './snippe-payment.provider';


@Injectable()
export class PaymentProviderFactory {
    private readonly logger = new Logger(PaymentProviderFactory.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly selcomProvider: SelcomPaymentProvider,
        private readonly snippeProvider: SnippePaymentProvider,
    ) {}

    // ============================================================
    // GET PROVIDER WITH PARAMETER - NEW METHOD
    // ============================================================
    
    getProvider(providerName?: string): PaymentProvider {
        // Use provided name or fallback to configured default
        const name = providerName || this.getProviderName();
        
        this.logger.log(`Getting payment provider: ${name}`);

        switch (name.toLowerCase()) {
            case 'selcom':
                return this.selcomProvider;

            case 'snippe':
                return this.snippeProvider;

            default:
                throw new InternalServerErrorException(
                    `Unsupported payment provider: ${name}`,
                );
        }
    }

    // ============================================================
    // GET PROVIDER NAME FROM CONFIG (Keep for backward compatibility)
    // ============================================================

    getProviderName(): string {
        return (
            this.configService.get<string>('PAYMENT_PROVIDER', 'snippe')
                .trim()
                .toLowerCase()
        );
    }
}