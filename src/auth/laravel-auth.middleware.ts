 import { Injectable, NestMiddleware } from '@nestjs/common';
import { LaravelAuthService } from './laravel-auth.service';

@Injectable()
export class LaravelAuthMiddleware implements NestMiddleware {
  constructor(private authService: LaravelAuthService) {}

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send('No token');
    }

    const token = authHeader.replace('Bearer ', '');

    const user = await this.authService.getUser(token);

    req.user = user; // attach Laravel user

    next();
  }
}