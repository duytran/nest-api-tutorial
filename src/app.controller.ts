import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return process.env.ENV_MESSAGE || 'hello';
  }
}
