import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SanctumGuard } from './guards/sanctum.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/chage-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
}
