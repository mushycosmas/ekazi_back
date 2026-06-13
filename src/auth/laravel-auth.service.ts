import { Injectable , UnauthorizedException} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LaravelAuthService {
    async getUser(token: string) {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/api/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid Laravel token');
    }
  }
}
