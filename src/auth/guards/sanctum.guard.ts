// import { Injectable,CanActivate } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { PersonalAccessToken } from "src/entities/personal-access-token.entity";
// import { Repository } from "typeorm";
// import { Users } from "src/entities/users.entity";
// import { ExecutionContext } from "@nestjs/common";
// import { UnauthorizedException } from "@nestjs/common";
// import { createHash } from "crypto";


// @Injectable()
// export class SanctumGuard implements CanActivate {
//   constructor(
//     @InjectRepository(PersonalAccessToken)
//     private tokenRepo: Repository<PersonalAccessToken>,

//     @InjectRepository(Users)
//     private userRepo: Repository<Users>,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();

//     const authHeader = req.headers.authorization;

//     if (!authHeader) throw new UnauthorizedException('No token');

//     const token = authHeader.replace('Bearer ', '');

//     const hashed = createHash('sha256').update(token).digest('hex');

//     const dbToken = await this.tokenRepo.findOne({
//       where: { token: hashed },
//     });

//     if (!dbToken) throw new UnauthorizedException('Invalid token');

//     const user = await this.userRepo.findOne({
//       where: { id: dbToken.tokenable_id },
//     });

//     if (!user) throw new UnauthorizedException('User not found');

//     // 🔥 attach to request
//     req.user = user;
//     req.token = dbToken;

//     return true;
//   }
// }
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PersonalAccessToken } from "src/entities/personal-access-token.entity";
import { Repository } from "typeorm";
import { Users } from "src/entities/users.entity";
import { createHash } from "crypto";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class SanctumGuard implements CanActivate {
  constructor(
    @InjectRepository(PersonalAccessToken)
    private tokenRepo: Repository<PersonalAccessToken>,

    @InjectRepository(Users)
    private userRepo: Repository<Users>,

    private reflector: Reflector, // Add this
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // Skip authentication for public routes
    if (isPublic) {
      return true;
    }

    // Original authentication logic
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token');

    const token = authHeader.replace('Bearer ', '');

    const hashed = createHash('sha256').update(token).digest('hex');

    const dbToken = await this.tokenRepo.findOne({
      where: { token: hashed },
    });

    if (!dbToken) throw new UnauthorizedException('Invalid token');

    const user = await this.userRepo.findOne({
      where: { id: dbToken.tokenable_id },
    });

    if (!user) throw new UnauthorizedException('User not found');

    // 🔥 attach to request
    req.user = user;
    req.token = dbToken;

    return true;
  }
}