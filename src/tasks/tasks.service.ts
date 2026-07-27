import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/tasks.entity';
import { Repository , DataSource} from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { TaskAssignment } from './entities/task-assignments.entity';
import { TaskAttachment } from './entities/task-attachments.entity';
 

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @InjectRepository(TaskAssignment)
        private readonly assignmentRepo: Repository<TaskAssignment>,

    @InjectRepository(TaskAttachment)
    private readonly attachmentRepository: Repository<TaskAttachment>,
    ) { }

    // async create(user: Users, dto: CreateTaskDto) {
    //     console.log('USER:', user); // DEBUG
    //     try {
    //         const task = this.taskRepository.create({
    //             ...dto,
    //             created_by: user.id,
    //         });

    //         await this.taskRepository.save(task);

    //         return {
    //             success: true,
    //             message: 'Task created successfully',
    //             data: task,
    //         };
    //     } catch (error) {
    //         throw new InternalServerErrorException({
    //             success: false,
    //             message: 'Failed to create task',
    //             error: error.message,
    //         });
    //     }
    // }
 async create(
    user: Users,
    dto: CreateTaskDto,
    files: Express.Multer.File[],
) {

    try {

        // =========================
        // Create Task
        // =========================

        const task = await this.taskRepository.save(

            this.taskRepository.create({

                title: dto.title,

                description: dto.description,

                deadline: dto.deadline,

                priority: dto.priority,

                status: dto.status,

                created_by: user.id,

            })

        );
        // =========================
        // Save Assignees
        // =========================

        if (dto.assignees && dto.assignees.length > 0) {
            const assignments =
                dto.assignees.map(userId =>

                    this.assignmentRepo.create({

                        task_id: task.id,

                        user_id: Number(userId),

                    })

                );

            await this.assignmentRepo.save(
                assignments
            );

        }
        // =========================
        // Save Attachments
        // =========================
   if (files && files.length > 0) {

    const attachments = files.map(file => {

        const filePath =
            `uploads/task/${file.filename}`;


        return this.attachmentRepository.create({

            task_id: task.id,

            filename:
                file.originalname,

            file_path:
                filePath,

            file_url:
                `${process.env.APP_URL}/${filePath}`,

        });

    });


    await this.attachmentRepository.save(
        attachments
    );
}



        // =========================
        // Return Response
        // =========================

        return {

            success: true,

            message: 'Task created successfully',

            data: task,

        };


    } catch(error) {


        throw new InternalServerErrorException({

            success:false,

            message:'Failed to create task',

            error:error.message,

        });

    }

}

    // async findAll(userId: number, query: TaskQueryDto) {
    //     const page = Number(query.page || 1);
    //     const limit = Number(query.limit || 20);

    //     const qb = this.taskRepository
    //         .createQueryBuilder('task')
    //         .leftJoinAndSelect('task.creator', 'creator')
    //         .where('task.created_by = :userId', { userId })
    //         .orderBy('task.id', 'DESC');

    //     if (query.search) {
    //         qb.andWhere(
    //             '(task.title LIKE :search OR task.description LIKE :search)',
    //             { search: `%${query.search}%` },
    //         );
    //     }

    //     if (query.status) {
    //         qb.andWhere('task.status = :status', {
    //             status: query.status,
    //         });
    //     }

    //     const total = await qb.getCount();

    //     const tasks = await qb
    //         .skip((page - 1) * limit)
    //         .take(limit)
    //         .getMany();

    //     return {
    //         success: true,
    //         message: 'Tasks retrieved successfully',
    //         data: tasks,
    //         current_page: page,
    //         per_page: limit,
    //         total_pages: Math.ceil(total / limit),
    //         total,
    //     };
    // }
    async findAll(userId: number, query: TaskQueryDto) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 20);

        // const qb = this.taskRepository
        //     .createQueryBuilder('task')
        //     // .leftJoinAndSelect('task.creator', 'creator')
        //     .where('task.created_by = :userId', { userId })
        //     .orderBy('task.id', 'DESC');
     const qb = this.taskRepository
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.assignments', 'assignment')
    .leftJoinAndSelect('assignment.user', 'assignedUser')

    .select([
        'task',

        'assignment.id',
        'assignment.task_id',
        'assignment.user_id',
        'assignment.assigned_at',

        'assignedUser.id',
        'assignedUser.username',
        'assignedUser.email',
    ])

    .where('task.created_by = :userId', { userId })
    .orderBy('task.id', 'DESC');
        if (query.search) {
            qb.andWhere(
                '(task.title LIKE :search OR task.description LIKE :search)',
                { search: `%${query.search}%` },
            );
        }
        if (query.status) {
            qb.andWhere('task.status = :status', {
                status: query.status,
            });
        }
        const total = await qb.getCount();
        const tasks = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        // Calculate statistics from tasks
        const statistics = {
            pending: tasks.filter(
                (task) => task.status === 'Pending',
            ).length,

            in_progress: tasks.filter(
                (task) => task.status === 'InProgress',
            ).length,

            completed: tasks.filter(
                (task) => task.status === 'Completed',
            ).length,

        };
        return {
            success: true,
            message: 'Tasks retrieved successfully',

            data: tasks,

            current_page: page,
            per_page: limit,
            total_pages: Math.ceil(total / limit),
            total,

            statistics: {
                total: total,

                by_status: {
                    pending: statistics.pending,
                    in_progress: statistics.in_progress,
                    completed: statistics.completed,

                },

                percentages: {
                    pending:
                        total > 0
                            ? Number(
                                (
                                    (statistics.pending / total) *
                                    100
                                ).toFixed(1),
                            )
                            : 0,

                    in_progress:
                        total > 0
                            ? Number(
                                (
                                    (statistics.in_progress / total) *
                                    100
                                ).toFixed(1),
                            )
                            : 0,

                    completed:
                        total > 0
                            ? Number(
                                (
                                    (statistics.completed / total) *
                                    100
                                ).toFixed(1),
                            )
                            : 0,

                },
            },
        };
    }

    async findOne(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['creator'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return {
            success: true,
            message: 'Task retrieved successfully',
            data: task,
        };
    }

    async update(userId: number, id: number, dto: UpdateTaskDto) {
        const task = await this.taskRepository.findOne({
            where: { id, created_by: userId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        Object.assign(task, dto);

        await this.taskRepository.save(task);

        return {
            success: true,
            message: 'Task updated successfully',
            data: task,
        };
    }
    async remove(userId: number, id: number) {
        const task = await this.taskRepository.findOne({
            where: { id, created_by: userId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await this.taskRepository.remove(task);

        return {
            success: true,
            message: 'Task deleted successfully',
        };
    }
    async assignTask(taskId: number, userId: number) {
        console.log('taskId:', taskId);
        console.log('userId:', userId);
        console.log('Number(taskId):', Number(taskId));
        const exists = await this.assignmentRepo.findOne({
            where: { task_id: taskId, user_id: userId },
        });

        if (exists) {
            return {
                success: false,
                message: 'Already assigned',
            };
        }

        const assignment = this.assignmentRepo.create({
            task_id: taskId,
            user_id: userId,
        });

        await this.assignmentRepo.save(assignment);

        return {
            success: true,
            message: 'Task assigned successfully',
            data: assignment,
        };
    }
}
