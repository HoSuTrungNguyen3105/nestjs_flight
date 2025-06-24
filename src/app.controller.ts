import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
type Params = {
  name: string;
  year: number;
};
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post()
  postHello(): Params {
    return this.appService.postHello();
  }
}
