import { Injectable } from '@nestjs/common';
type Params = {
  name: string;
  year: number;
};
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  postHello(): Params {
    return { name: 'name', year: 33 };
  }
}
