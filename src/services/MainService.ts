import { Injectable } from '@nestjs/common';

@Injectable()
export class MainService {
  getStatus(): { status: string } {
    return { status: 'OK' };
  }
}
