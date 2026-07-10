 import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Stage } from 'src/entities/stage.entity';
import { Users } from 'src/entities/users.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Regions } from 'src/entities/regions.entity';

import { MailService } from 'src/mail/mail.service';

import { BulkShortListDto } from './dto/bulk-shortlist.dto';

import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class ApplicantStagesService {


constructor(

    private readonly dataSource:DataSource,


    @InjectRepository(Jobs)
    private readonly jobRepository:Repository<Jobs>,
    @InjectRepository(Stage)
    private readonly stageRepository:Repository<Stage>,
    @InjectRepository(JobStage)
    private readonly jobStageRepository:Repository<JobStage>,


    @InjectRepository(ApplicantApplication)
    private readonly applicantApplicationRepository:Repository<ApplicantApplication>,


    @InjectRepository(Regions)
    private readonly regionRepository:Repository<Regions>,


    private readonly mailService:MailService

){}





async bulkShortList(
    dto:BulkShortListDto,
    user:Users
){


const stage =
await this.stageRepository.findOne({

where:{
id:dto.stage_id
}

});


if(!stage)
{
throw new NotFoundException(
'Stage not found'
);
}



switch(stage.stage_name)
{


case 'Shortlisted':

await this.shortListedStage(
    dto,
    user.id
);

break;



case 'Screening':

await this.screenStage(dto);

break;



case 'Interview':

await this.interViewStage(dto);

break;



case 'Selection':

await this.selectionStage(dto);

break;



case 'Background Check':

await this.backgroundStage(dto);

break;



default:

throw new Error(
'Invalid stage selected'
);


}


return true;

}






private async screenStage(
dto:BulkShortListDto
)
{

// Screening logic

}





private async interViewStage(
dto:BulkShortListDto
)
{

// Interview logic

}





private async selectionStage(
dto:BulkShortListDto
)
{

// Selection logic

}





private async backgroundStage(
dto:BulkShortListDto
)
{

// Background Check logic

}







async shortListedStage(
dto:BulkShortListDto,
userId:number
){


const queryRunner =
this.dataSource.createQueryRunner();


await queryRunner.connect();

await queryRunner.startTransaction();



try {



const stage =
await this.stageRepository.findOne({

where:{
id:dto.stage_id
}

});



if(!stage)
{
throw new Error(
'Stage not found'
);
}





const job =
await this.jobRepository.findOne({

where:{
id:dto.job_id
},

relations:[
'client'
]

});



if(!job)
{
throw new Error(
'Job not found'
);
}





// Update Job Stage

await queryRunner.manager.update(

Jobs,

dto.job_id,

{

stage_id:dto.stage_id

}

);






// Location

const inviteLocation =
await this.regionRepository.findOne({

where:{
id:dto.region_id
}

});








for(
const applicantId of dto.applicant_id
)
{





// =============================
// Create Job Stage
// =============================


let jobStage =
await this.jobStageRepository.findOne({

where:{

job_id:dto.job_id,

stage_id:dto.stage_id,

applicant_id:applicantId

}

});




if(!jobStage)
{

jobStage =
await queryRunner.manager.save(

JobStage,

{

job_id:dto.job_id,

stage_id:dto.stage_id,

applicant_id:applicantId,

creator_id:userId,

updator_id:userId

}

);


}








// =============================
// Update Applicant Application
// =============================


await queryRunner.manager.update(

ApplicantApplication,

{

job_id:dto.job_id,

applicant_id:applicantId

},

{

stage_id:dto.stage_id,

status:stage.stage_name

}

);








// =============================
// Get Applicant
// =============================


const applicant =

await queryRunner.manager

.createQueryBuilder()

.select([

'user.email AS email',

'user.first_name AS first_name',

'user.last_name AS last_name'

])


.from(
'applicants',
'applicant'
)


.innerJoin(

'users',

'user',

'user.id = applicant.user_id'

)


.where(

'applicant.id = :id',

{
id:applicantId
}

)

.getRawOne();






if(applicant)
{


await this.sendShortListEmail({

applicant,

job,

stage,

inviteLocation,

dto

});


}



}



await queryRunner.commitTransaction();



}

catch(error)
{


await queryRunner.rollbackTransaction();

throw error;


}

finally
{

await queryRunner.release();

}


}









private async sendShortListEmail(
data:any
)
{


const {

applicant,

job,

stage,

inviteLocation,

dto

}=data;






const templateData = {


subject:

`Shortlisted: ${dto.position_name} Application Update`,


position_name:

dto.position_name ?? '',



client_name:

job.client?.client_name ?? '',



stage_name:

stage.stage_name,



address:

dto.address ?? '',



invite_date:

dto.invite_date ?? '',



message_body:

dto.message_body ?? '',



first_name:

applicant.first_name,



last_name:

applicant.last_name,



region_name:

inviteLocation?.region_name ?? '',



country:

inviteLocation?.country?.name ?? ''

};






const templatePath = path.join(

process.cwd(),

'src',

'mail',

'templates',

'emails',

'recruitment',

'invite.template.html'

);




let html = fs.readFileSync(

templatePath,

'utf8'

);







Object.keys(templateData)
.forEach(key=>{


html =
html.replace(

new RegExp(
`{{\\s*${key}\\s*}}`,
'g'
),

String(
templateData[key] ?? ''
)

);



});







await this.mailService.sendMail({

from:

`"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,



to:

applicant.email,



subject:

templateData.subject,



html


});



}


}