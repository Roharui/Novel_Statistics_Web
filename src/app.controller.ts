import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  app() {
    return { text: 'Hello World' };
  }
}
