 import {
     Injectable,
     NotFoundException,
     BadRequestException,
     ConflictException,
     InternalServerErrorException,
     Logger,
 } from '@nestjs/common';
 
 import {
     InjectRepository,
 } from '@nestjs/typeorm';
 
 import {
     DataSource,
     Repository,
 } from 'typeorm';
 
 import {
     randomUUID,
 } from 'crypto';
 
 import { Users } from 'src/entities/users.entity';
 
 
 import { Applicants } from 'src/entities/applicants/applicants.entity';
 import { Clients } from 'src/client/clients.entity';
 
 import { Subscription } from './entities/subscription.entity';
 import { SubscriptionPlan } from './entities/subscription-plan.entity';
 
 import {
     SubscriptionPayment,
     PaymentStatus,
     PaymentRole,
 } from './entities/subscription-payment.entity';
 
 import {
     InitiatePaymentDto,
 } from './dto/initiate-payment.dto';
 
 import {
     PaymentProviderFactory,
 } from './providers/payment-provider.factory';
 
 
 @Injectable()
 export class PaymentService {
 
     private readonly logger =
         new Logger(
             PaymentService.name,
         );
 
 
     constructor(
 
         @InjectRepository(Subscription)
         private readonly subscriptionRepository:
             Repository<Subscription>,
 
 
         @InjectRepository(SubscriptionPlan)
         private readonly subscriptionPlanRepository:
             Repository<SubscriptionPlan>,
 
 
         @InjectRepository(SubscriptionPayment)
         private readonly subscriptionPaymentRepository:
             Repository<SubscriptionPayment>,
 
 
         @InjectRepository(Applicants)
         private readonly applicantRepository:
             Repository<Applicants>,
 
 
         @InjectRepository(Clients)
         private readonly clientRepository:
             Repository<Clients>,
 
 
         private readonly paymentProviderFactory:
             PaymentProviderFactory,
 
 
         private readonly dataSource:
             DataSource,
 
     ) { }
 
 
     // ============================================================
     // RESOLVE CUSTOMER INFORMATION
     // ============================================================
 
     private async resolveCustomer(
         user: Users,
         role: PaymentRole,
         phone: string,
     ) {
 
         // --------------------------------------------------------
         // EMAIL ALWAYS COMES FROM USERS
         // --------------------------------------------------------
 
         const email =
             user.email?.trim();
 
 
         if (!email) {
 
             throw new BadRequestException(
                 'User email is required for payment',
             );
 
         }
 
 
         // ========================================================
         // APPLICANT
         // ========================================================
 
         if (
             role === PaymentRole.APPLICANT
         ) {
 
             const applicant =
                 await this.applicantRepository.findOne({
 
                     where: {
 
                         user_id:
                             user.id,
 
                     },
 
                 });
 
 
             if (!applicant) {
 
                 throw new NotFoundException(
                     'Applicant profile not found',
                 );
 
             }
 
 
             const firstName =
                 applicant.first_name?.trim() ||
                 'Applicant';
 
 
             const middleName =
                 applicant.middle_name?.trim() ||
                 '';
 
 
             const lastName =
                 applicant.last_name?.trim() ||
                 'Customer';
 
 
             return {
 
                 firstname:
                     firstName,
 
                 lastname:
                     lastName,
 
                 middlename:
                     middleName,
 
                 email,
 
                 phone,
 
                 name:
                     [
                         firstName,
                         middleName,
                         lastName,
                     ]
                         .filter(Boolean)
                         .join(' '),
 
             };
 
         }
 
 
         // ========================================================
         // EMPLOYER / CLIENT
         // ========================================================
 
 
 
         if (role === PaymentRole.EMPLOYER) {
 
             const client =
                 await this.clientRepository.findOne({
                     where: {
                         user_id: user.id,
                     },
                 });
 
             if (!client) {
                 throw new NotFoundException(
                     'Employer/client profile not found',
                 );
             }
 
             // Get names directly from CLIENT
             const firstname =
                 client.first_name?.trim();
 
             const lastname =
                 client.last_name?.trim();
 
             // Validate before sending to payment provider
             if (!firstname) {
                 throw new BadRequestException(
                     'Client first name is required for payment',
                 );
             }
 
             if (!lastname) {
                 throw new BadRequestException(
                     'Client last name is required for payment',
                 );
             }
 
             return {
                 firstname,
                 lastname,
 
                 middlename: '',
 
                 email,
 
                 phone,
 
                 name: [
                     firstname,
                     lastname,
                 ]
                     .filter(Boolean)
                     .join(' '),
 
                 client_id: client.id,
             };
         }
 
 
         throw new BadRequestException(
             'Unsupported payment role',
         );
 
     }
 
 
     // ============================================================
     // INITIATE PAYMENT
     // ============================================================
 
     async initiatePayment(
 
         dto: InitiatePaymentDto,
 
         user: Users,
 
     ) {
 
         // ========================================================
         // FIND PLAN
         // ========================================================
 
         const plan =
             await this.subscriptionPlanRepository.findOne({
 
                 where: {
 
                     id:
                         dto.plan_id,
 
                 },
 
             });
 
 
         if (!plan) {
 
             throw new NotFoundException(
                 'Subscription plan not found',
             );
 
         }
 
 
         // ========================================================
         // DETERMINE ROLE
         // ========================================================
 
         const role =
             plan.role === 'applicant'
                 ? PaymentRole.APPLICANT
                 : PaymentRole.EMPLOYER;
 
 
         // ========================================================
         // RESOLVE CUSTOMER
         // ========================================================
 
         const customer =
             await this.resolveCustomer(
 
                 user,
 
                 role,
 
                 dto.phone,
 
             );
 
 
         this.logger.log(
             `Payment customer resolved: ${JSON.stringify({
                 userId: user.id,
                 role,
                 firstname: customer.firstname,
                 lastname: customer.lastname,
                 middlename: customer.middlename,
                 email: customer.email,
                 phone: customer.phone,
                 name: customer.name,
             })}`,
         );
 
 
         // ========================================================
         // CHECK ACTIVE SUBSCRIPTION
         // ========================================================
 
         const currentSubscription =
             await this.subscriptionRepository.findOne({
 
                 where: {
 
                     user_id:
                         user.id,
 
                     is_active:
                         true,
 
                 },
 
                 relations: [
                     'plan',
                 ],
 
                 order: {
 
                     end_date:
                         'DESC',
 
                 },
 
             });
 
 
         // ========================================================
         // PAYMENT AMOUNT
         // ========================================================
 
         let amount =
             Number(plan.price);
 
 
         // ========================================================
         // PRORATE UPGRADE
         // ========================================================
 
         if (
 
             currentSubscription &&
 
             currentSubscription.plan &&
 
             currentSubscription.plan.id !==
             plan.id
 
         ) {
 
             const now =
                 new Date();
 
 
             const endDate =
                 new Date(
                     currentSubscription.end_date,
                 );
 
 
             let remainingDays =
                 Math.ceil(
 
                     (
                         endDate.getTime() -
                         now.getTime()
                     )
                     /
                     (
                         1000 *
                         60 *
                         60 *
                         24
                     ),
 
                 );
 
 
             if (
                 remainingDays < 0
             ) {
 
                 remainingDays = 0;
 
             }
 
 
             const oldPlan =
                 await this.subscriptionPlanRepository.findOne({
 
                     where: {
 
                         id:
                             currentSubscription.plan.id,
 
                     },
 
                 });
 
 
             if (
 
                 oldPlan &&
 
                 Number(oldPlan.duration_days) > 0
 
             ) {
 
                 const credit =
 
                     (
                         Number(oldPlan.price)
                         /
                         Number(oldPlan.duration_days)
                     )
                     *
                     remainingDays;
 
 
                 amount =
                     Math.max(
 
                         0,
 
                         Number(plan.price)
                         -
                         credit,
 
                     );
 
             }
 
         }
 
 
         // ========================================================
         // PREVENT DUPLICATE PENDING PAYMENT
         // ========================================================
 
         const existingPayment =
             await this.subscriptionPaymentRepository.findOne({
 
                 where: {
 
                     user_id:
                         user.id,
 
                     subscription_plan_id:
                         plan.id,
 
                     status:
                         PaymentStatus.PENDING,
 
                 },
 
             });
 
 
         if (existingPayment) {
 
             const createdAt =
                 new Date(
                     existingPayment.created_at,
                 );
 
 
             const fiveMinutesAgo =
                 new Date(
 
                     Date.now()
                     -
                     5 * 60 * 1000,
 
                 );
 
 
             if (
                 createdAt > fiveMinutesAgo
             ) {
 
                 return {
 
                     success:
                         false,
 
                     message:
                         'You already have a pending payment',
 
                     data: {
 
                         reference:
                             existingPayment.transaction_id,
 
                         amount:
                             existingPayment.amount,
 
                     },
 
                 };
 
             }
 
 
             /*
              * Old pending payment is no longer considered active.
              * Mark it failed before creating a new payment.
              */
 
             await this.subscriptionPaymentRepository.update(
 
                 {
                     id:
                         existingPayment.id,
                 },
 
                 {
                     status:
                         PaymentStatus.FAILED,
                 },
 
             );
 
         }
 
 
         // ========================================================
         // UNIQUE REFERENCE
         // ========================================================
 
         const reference =
             `SUB_${Date.now()}_${randomUUID()
                 .replace(/-/g, '')
                 .substring(0, 10)
                 .toUpperCase()}`;
 
 
         // ========================================================
         // CREATE PAYMENT
         // ========================================================
 
         const payment =
             this.subscriptionPaymentRepository.create({
 
                 user_id:
                     user.id,
 
                 subscription_plan_id:
                     plan.id,
 
                 amount,
 
                 transaction_id:
                     reference,
 
                 provider:
                     dto.provider?? 'snippe',
 
                 role,
 
                 status:
                     PaymentStatus.PENDING,
 
                 meta:
                 {
 
                     customer: {
 
                         firstname:
                             customer.firstname,
 
                         lastname:
                             customer.lastname,
 
                         middlename:
                             customer.middlename,
 
                         email:
                             customer.email,
 
                         phone:
                             customer.phone,
 
                     },
 
                 },
 
             });
 
 
         await this.subscriptionPaymentRepository.save(
             payment,
         );
 
 
         // ========================================================
         // CALLBACK
         // ========================================================
 
         const callbackUrl =
             process.env.PAYMENT_CALLBACK_URL ||
             'https://backend.ekazi.co.tz/api/payment/callback/snippe';
 
 
         // ========================================================
         // PROVIDER
         // ========================================================
 
         const provider =
             this.paymentProviderFactory.getProvider();
 
 
         this.logger.log(
             `Using payment provider: ${dto.provider}`,
         );
 
 
         // ========================================================
         // INITIATE
         // ========================================================
 
         const providerResponse =
             await provider.initiate({
 
                 reference,
 
                 amount,
 
                 phone:
                     dto.phone,
 
                 currency:
                     'TZS',
 
                 callbackUrl,
 
                 customer,
 
             });
 
         // ========================================================
         // PROVIDER FAILED
         // ========================================================
 
         if (
             !providerResponse.success
         ) {
 
             await this.subscriptionPaymentRepository.update(
 
                 {
                     id:
                         payment.id,
                 },
 
                 {
                     status:
                         PaymentStatus.FAILED,
                 },
 
             );
 
 
             throw new BadRequestException({
 
                 success:
                     false,
 
                 message:
                     providerResponse.message ||
                     'Payment initiation failed',
 
                 data:
                     providerResponse.raw,
 
             });
 
         }
         // ========================================================
         // SAVE SNIPPE PROVIDER TRANSACTION ID
         // ========================================================
 
         if (!providerResponse.transactionId) {
 
             await this.subscriptionPaymentRepository.update(
                 {
                     id: payment.id,
                 },
                 {
                     status:
                         PaymentStatus.FAILED,
 
                     failure_reason:
                         'Snippe did not return a transaction reference',
                 },
             );
 
             throw new BadRequestException(
                 'Snippe did not return a transaction reference',
             );
         }
 
         payment.provider_transaction_id =
             providerResponse.transactionId;
 
         await this.subscriptionPaymentRepository.save(
             payment,
         );
 
         // ========================================================
         // RESPONSE
         // ========================================================
 
         return {
 
             success:
                 true,
 
             message:
                 'Payment initiated successfully',
 
             data: {
 
                 reference,
 
                 amount,
 
                 currency:
                     'TZS',
 
                 provider:
                     dto.provider,
 
                 customer: {
 
                     firstname:
                         customer.firstname,
 
                     lastname:
                         customer.lastname,
 
                     email:
                         customer.email,
 
                     phone:
                         customer.phone,
 
                 },
 
                 payment:
                     providerResponse.raw,
 
             },
 
         };
 
     }
 
 
     // ============================================================
     // SELCOM CALLBACK
     // ============================================================
 
     async handleSelcomCallback(
         payload: any,
     ) {
 
         const reference =
 
             payload?.order_id ||
 
             payload?.reference ||
 
             payload?.transaction_id;
 
 
         if (!reference) {
 
             throw new BadRequestException(
                 'Payment reference is required',
             );
 
         }
 
 
         const payment =
             await this.subscriptionPaymentRepository.findOne({
 
                 where: {
 
                     transaction_id:
                         reference,
 
                 },
 
             });
 
 
         if (!payment) {
 
             throw new NotFoundException(
                 'Payment not found',
             );
 
         }
 
 
         if (
             payment.status ===
             PaymentStatus.SUCCESS
         ) {
 
             return {
 
                 success:
                     true,
 
                 message:
                     'Payment already processed',
 
             };
 
         }
 
 
         const provider =
             this.paymentProviderFactory.getProvider();
 
 
         const verification =
             await provider.verify({
 
                 reference,
 
             });
 
 
         if (
             !verification.success
         ) {
 
             await this.subscriptionPaymentRepository.update(
 
                 {
                     id:
                         payment.id,
                 },
 
                 {
                     status:
                         PaymentStatus.FAILED,
                 },
 
             );
 
 
             throw new BadRequestException({
 
                 success:
                     false,
 
                 message:
                     'Payment verification failed',
 
             });
 
         }
 
 
         await this.activateSubscription(
             payment.id,
         );
 
 
         return {
 
             success:
                 true,
 
             message:
                 'Subscription activated successfully',
 
         };
 
     }
 
 
     // ============================================================
     // SNIPPE WEBHOOK
     // ============================================================
 
     // ============================================================
     // SNIPPE WEBHOOK
     // ============================================================
 
     async handleSnippeWebhook(
         event: any,
     ) {
         try {
 
             // --------------------------------------------------------
             // LOG FULL WEBHOOK
             // --------------------------------------------------------
 
             this.logger.log(
                 `Snippe webhook received: ${JSON.stringify(event)}`,
             );
 
             // --------------------------------------------------------
             // EVENT TYPE
             // --------------------------------------------------------
 
             const eventType =
                 event?.type ||
                 event?.event;
 
             this.logger.log(
                 `Snippe event type: ${eventType}`,
             );
 
             // --------------------------------------------------------
             // SNIPPE PAYMENT REFERENCE
             //
             // Example:
             // SN1787557846088555
             // --------------------------------------------------------
 
             const snippeReference =
                 event?.data?.reference ||
                 event?.reference;
 
             // --------------------------------------------------------
             // YOUR INTERNAL REFERENCE
             //
             // Example:
             // SUB_1787557845327_2D5AFCC55
             //
             // This is what you stored in:
             // subscription_payments.transaction_id
             // --------------------------------------------------------
 
             const internalReference =
                 event?.data?.metadata?.order_id ||
                 event?.metadata?.order_id ||
                 event?.data?.order_id ||
                 event?.order_id;
 
             this.logger.log(
                 `Snippe reference: ${snippeReference}`,
             );
 
             this.logger.log(
                 `Internal reference: ${internalReference}`,
             );
 
             // --------------------------------------------------------
             // REFERENCE REQUIRED
             // --------------------------------------------------------
 
             if (!internalReference) {
 
                 this.logger.error(
                     `Internal payment reference missing from webhook: ${JSON.stringify(event)}`,
                 );
 
                 throw new BadRequestException(
                     'Internal payment reference not found in Snippe webhook',
                 );
             }
 
             // --------------------------------------------------------
             // FIND PAYMENT USING OUR REFERENCE
             // --------------------------------------------------------
 
             const payment =
                 await this.subscriptionPaymentRepository.findOne({
 
                     where: {
 
                         transaction_id:
                             internalReference,
 
                     },
 
                 });
 
             if (!payment) {
 
                 this.logger.error(
                     `Payment not found using internal reference: ${internalReference}`,
                 );
 
                 throw new NotFoundException(
                     `Payment not found: ${internalReference}`,
                 );
             }
 
             this.logger.log(
                 `Payment found: ID=${payment.id}, status=${payment.status}`,
             );
 
             // --------------------------------------------------------
             // ALREADY PROCESSED
             // --------------------------------------------------------
 
             if (
                 payment.status ===
                 PaymentStatus.SUCCESS
             ) {
 
                 return {
 
                     success: true,
 
                     message:
                         'Payment already processed',
 
                 };
             }
 
             // --------------------------------------------------------
             // HANDLE FAILED PAYMENT
             // --------------------------------------------------------
 
             if (
                 eventType === 'payment.failed' ||
                 eventType === 'payment.expired' ||
                 eventType === 'payment.voided'
             ) {
 
                 await this.subscriptionPaymentRepository.update(
 
                     {
                         id: payment.id,
                     },
 
                     {
                         status:
                             PaymentStatus.FAILED,
                     },
 
                 );
 
                 this.logger.warn(
                     `Payment marked as failed: ${internalReference}`,
                 );
 
                 return {
 
                     success: true,
 
                     message:
                         'Payment marked as failed',
 
                 };
             }
 
             // --------------------------------------------------------
             // ONLY PROCESS COMPLETED PAYMENT
             // --------------------------------------------------------
 
             if (
                 eventType !== 'payment.completed'
             ) {
 
                 this.logger.log(
                     `Ignoring Snippe event: ${eventType}`,
                 );
 
                 return {
 
                     success: true,
 
                     message:
                         'Webhook event ignored',
 
                 };
             }
 
             // --------------------------------------------------------
             // CHECK SNIPPE REFERENCE
             // --------------------------------------------------------
 
             if (!snippeReference) {
 
                 this.logger.error(
                     `Snippe reference missing for payment: ${internalReference}`,
                 );
 
                 throw new BadRequestException(
                     'Snippe payment reference is missing',
                 );
             }
 
             // --------------------------------------------------------
             // CHECK WEBHOOK STATUS
             // --------------------------------------------------------
 
             const webhookStatus =
                 event?.data?.status;
 
             this.logger.log(
                 `Snippe webhook payment status: ${webhookStatus}`,
             );
 
             if (
                 webhookStatus !== 'completed'
             ) {
 
                 this.logger.warn(
                     `Payment webhook received but status is ${webhookStatus}`,
                 );
 
                 return {
 
                     success: false,
 
                     message:
                         `Payment is not completed. Current status: ${webhookStatus}`,
 
                 };
             }
 
             // --------------------------------------------------------
             // VERIFY PAYMENT WITH SNIPPE
             // --------------------------------------------------------
 
             const provider =
                 this.paymentProviderFactory.getProvider();
 
             const verification =
                 await provider.verify({
 
                     reference:
                         snippeReference,
 
                 });
 
             this.logger.log(
                 `Snippe verification result: ${JSON.stringify({
                     success: verification.success,
                     transactionId: verification.transactionId,
                     message: verification.message,
                 })}`,
             );
 
             if (
                 !verification.success
             ) {
 
                 this.logger.error(
                     `Snippe payment verification failed: ${snippeReference}`,
                 );
 
                 return {
 
                     success: false,
 
                     message:
                         'Payment verification failed',
 
                 };
             }
 
             // --------------------------------------------------------
             // ACTIVATE SUBSCRIPTION
             // --------------------------------------------------------
 
             await this.activateSubscription(
                 payment.id,
             );
 
             this.logger.log(
                 `Subscription successfully activated for payment ${payment.id}`,
             );
 
             return {
 
                 success: true,
 
                 message:
                     'Snippe payment processed successfully',
 
             };
 
         } catch (error) {
 
             this.logger.error(
                 'Snippe webhook processing failed',
                 error?.stack || error,
             );
 
             throw error;
         }
     }
 
 
     // ============================================================
     // ACTIVATE SUBSCRIPTION
     // ============================================================
 
     private async activateSubscription(
         paymentId: number,
     ) {
 
         const queryRunner =
             this.dataSource.createQueryRunner();
 
 
         await queryRunner.connect();
 
         await queryRunner.startTransaction();
 
 
         try {
 
             const payment =
                 await queryRunner.manager
 
                     .createQueryBuilder(
                         SubscriptionPayment,
                         'payment',
                     )
 
                     .setLock(
                         'pessimistic_write',
                     )
 
                     .where(
                         'payment.id = :paymentId',
                         {
                             paymentId,
                         },
                     )
 
                     .getOne();
 
 
             if (!payment) {
 
                 throw new NotFoundException(
                     'Payment not found',
                 );
 
             }
 
 
             if (
                 payment.status ===
                 PaymentStatus.SUCCESS
             ) {
 
                 await queryRunner.commitTransaction();
 
                 return;
 
             }
 
 
             const plan =
                 await queryRunner.manager.findOne(
                     SubscriptionPlan,
                     {
 
                         where: {
 
                             id:
                                 payment.subscription_plan_id,
 
                         },
 
                     },
                 );
 
 
             if (!plan) {
 
                 throw new NotFoundException(
                     'Subscription plan not found',
                 );
 
             }
 
 
             // ----------------------------------------------------
             // DEACTIVATE OLD
             // ----------------------------------------------------
 
             await queryRunner.manager.update(
 
                 Subscription,
 
                 {
 
                     user_id:
                         payment.user_id,
 
                     is_active:
                         true,
 
                 },
 
                 {
 
                     is_active:
                         false,
 
                 },
 
             );
 
 
             // ----------------------------------------------------
             // DATES
             // ----------------------------------------------------
 
             const startDate =
                 new Date();
 
 
             const endDate =
                 new Date(
                     startDate,
                 );
 
 
             endDate.setDate(
 
                 endDate.getDate()
                 +
                 Number(
                     plan.duration_days,
                 ),
 
             );
 
 
             // ----------------------------------------------------
             // CREATE SUBSCRIPTION
             // ----------------------------------------------------
 
             const subscription =
                 queryRunner.manager.create(
 
                     Subscription,
 
                     {
 
                         user_id:
                             payment.user_id,
 
                         subscription_plan_id:
                             plan.id,
 
                         start_date:
                             startDate,
 
                         end_date:
                             endDate,
 
                         job_post_remaining:
                             plan.job_post_limit ??
                             -1,
 
                         cv_download_remaining:
                             plan.cv_download_limit ??
                             -1,
                             cv_builder_remaining:plan.cv_builder_limit??
                             -1,
                           
 
                         is_active:
                             true,
 
                     },
 
                 );
 
 
             await queryRunner.manager.save(
                 Subscription,
                 subscription,
             );
 
 
             // ----------------------------------------------------
             // SUCCESS
             // ----------------------------------------------------
 
             payment.status =
                 PaymentStatus.SUCCESS;
 
 
             await queryRunner.manager.save(
                 SubscriptionPayment,
                 payment,
             );
 
 
             await queryRunner.commitTransaction();
 
         } catch (error) {
 
             await queryRunner.rollbackTransaction();
 
 
             this.logger.error(
                 'Subscription activation failed',
                 error,
             );
 
 
             throw new InternalServerErrorException(
                 'Failed to activate subscription',
             );
 
         } finally {
 
             await queryRunner.release();
 
         }
 
     }
 
 
     // ============================================================
     // CURRENT SUBSCRIPTION
     // ============================================================
 
     async currentSubscription(
         user: Users,
     ) {
 
         const subscription =
             await this.subscriptionRepository.findOne({
 
                 where: {
 
                     user_id:
                         user.id,
 
                     is_active:
                         true,
 
                 },
 
                 relations: [
                     'plan',
                 ],
 
                 order: {
 
                     end_date:
                         'DESC',
 
                 },
 
             });
 
 
         if (!subscription) {
 
             return {
 
                 success:
                     false,
 
                 message:
                     'No active subscription',
 
                 data:
                     null,
 
             };
 
         }
 
 
         if (
             new Date(
                 subscription.end_date,
             ) < new Date()
         ) {
 
             subscription.is_active =
                 false;
 
 
             await this.subscriptionRepository.save(
                 subscription,
             );
 
 
             return {
 
                 success:
                     false,
 
                 message:
                     'Subscription has expired',
 
                 data:
                     null,
 
             };
 
         }
 
 
         return {
 
             success:
                 true,
 
             message:
                 'Current subscription retrieved successfully',
 
             data:
                 subscription,
 
         };
 
     }
 
 }