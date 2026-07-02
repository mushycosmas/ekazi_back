import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SanctumGuard } from './guards/sanctum.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/chage-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Users } from 'src/entities/users.entity';
import { CreateEmployerDto } from 'src/employer/dto/create-employer.dto';
import { BadRequestException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    registerEmployer(@Body() dto: CreateEmployerDto) {
        return this.authService.registerEmployer(dto);
    }


    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(
            loginDto.username,
            loginDto.password,
        );
    }
    @UseGuards(SanctumGuard)
    @Post('logout')
    logout(@Req() req) {
        return this.authService.logout(req);
    }

    @UseGuards(SanctumGuard)
    @Post('change-password')
    changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(user, dto);
    }

    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }
    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
    @UseGuards(SanctumGuard)
    @Get('user')
    employerAccount(@CurrentUser() user: Users) {
        return this.authService.myaccount(user);
    }

    // 📧 Send verification email
    @Post('send-verification-email')
    @UseGuards(SanctumGuard)
    async sendVerificationEmail(@CurrentUser() user: Users) {
        if (!user.email) {
            throw new BadRequestException('User email is missing');
        }
          if (!user.username) {
            throw new BadRequestException('User email is missing');
        }

        return this.authService.sendVerificationEmail(
            user.email,
            user.username,
        );
    }

    // ✅ Verify email (clicked from frontend link)
    @Get('verify-email')
    async verifyEmail(
        @Query('email') email: string,
        @Query('token') token: string,
    ) {
        return this.authService.verifyEmail(email, token);
    }
}
