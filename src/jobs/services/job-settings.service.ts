import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Jobs } from '../entities/job.entity';
import { JobEmails } from '../entities/job-emails.entity';
import { JobExternalUrls } from '../entities/job-external-urls.entity';
import { JobApplicationModals } from '../entities/job-application-modals.entity';

import { UpdateJobSettingsDto } from '../dtos/update-job-settings.dto';


@Injectable()
export class JobSettingsService {

    constructor(

        private readonly dataSource: DataSource,


        @InjectRepository(Jobs)
        private readonly jobRepository: Repository<Jobs>,


        @InjectRepository(JobEmails)
        private readonly jobEmailRepository: Repository<JobEmails>,


        @InjectRepository(JobExternalUrls)
        private readonly externalRepository: Repository<JobExternalUrls>,


        @InjectRepository(JobApplicationModals)
        private readonly applicationModalRepository: Repository<JobApplicationModals>,

    ) {}



    /**
     * Create or update application modal
     */
    private async saveApplicationModal(
        manager: any,
        jobId: number,
        status: string,
        message: string,
    ) {


        let modal = await manager.findOne(
            JobApplicationModals,
            {
                where:{
                    job_id: jobId,
                }
            }
        );



        if(modal){


            modal.status = status;
            modal.message = message;


        }else{


            modal = manager.create(
                JobApplicationModals,
                {
                    job_id: jobId,
                    status,
                    message,
                }
            );

        }



        return manager.save(modal);

    }






    async updateSettings(
        jobId:number,
        dto:UpdateJobSettingsDto,
    ){


        const queryRunner =
            this.dataSource.createQueryRunner();



        await queryRunner.connect();

        await queryRunner.startTransaction();



        try{


            const job =
                await queryRunner.manager.findOne(
                    Jobs,
                    {
                        where:{
                            id:jobId
                        }
                    }
                );



            if(!job){

                throw new NotFoundException(
                    'Job not found'
                );

            }




            /**
             * Update show client name
             */
            if(dto.show_client_name !== undefined){


                job.show_client_name =
                    dto.show_client_name;


                await queryRunner.manager.save(
                    Jobs,
                    job
                );

            }





            /**
             * Remove old email and external url
             *
             * Only one apply method allowed
             */
            await queryRunner.manager.delete(
                JobEmails,
                {
                    job_id:jobId
                }
            );



            await queryRunner.manager.delete(
                JobExternalUrls,
                {
                    job_id:jobId
                }
            );







            /**
             * No apply condition
             */
            if(dto.apply_condition === false){



                await this.saveApplicationModal(
                    queryRunner.manager,
                    jobId,
                    'none',
                    'Apply condition not selected'
                );


            }







            /**
             * Apply by email
             */
            if(
                dto.apply_condition === true &&
                dto.apply_type === 'email'
            ){



                if(!dto.email){

                    throw new Error(
                        'Email is required'
                    );

                }




                // remove external url
                await queryRunner.manager.delete(
                    JobExternalUrls,
                    {
                        job_id:jobId
                    }
                );




                await this.saveApplicationModal(
                    queryRunner.manager,
                    jobId,
                    'email',
                    'Apply using email'
                );





                await queryRunner.manager.save(
                    JobEmails,
                    {
                        job_id:jobId,
                        email:dto.email,
                    }
                );



            }









            /**
             * Apply by external URL
             */
            if(
                dto.apply_condition === true &&
                dto.apply_type === 'external_url'
            ){



                if(!dto.external_url){

                    throw new Error(
                        'External URL is required'
                    );

                }





                // remove email
                await queryRunner.manager.delete(
                    JobEmails,
                    {
                        job_id:jobId
                    }
                );






                await this.saveApplicationModal(
                    queryRunner.manager,
                    jobId,
                    'external_url',
                    'Apply using external URL'
                );

                await queryRunner.manager.save(
                    JobExternalUrls,
                    {
                        job_id:jobId,
                        external_url:dto.external_url,
                    }
                );


            }

            await queryRunner.commitTransaction();

            return {

                success:true,

                message:
                'Job settings updated successfully',


                data:{

                    job_id:job.id,

                    show_client_name:
                    job.show_client_name,

                    apply_type:
                    dto.apply_type ?? 'none'

                }

            };



        }catch(error){


            await queryRunner.rollbackTransaction();


            throw error;



        }finally{


            await queryRunner.release();

        }


    }



}