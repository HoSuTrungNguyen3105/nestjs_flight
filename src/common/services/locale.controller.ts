import { Body, Controller, Post } from '@nestjs/common';
import { LocaleService } from './locale-countries.service';
import { LocaleRequestDto } from './locale-request.dto';

@Controller('sys/locale')
export class LocaleController {
  constructor(private readonly localeService: LocaleService) {}

  @Post('config')
  async getLocaleConfig(@Body() body: LocaleRequestDto) {
    const { language, currency } = body;
    const data = await this.localeService.buildLocaleConfig(language, currency);

    return {
      resultCode: '00',
      resultMessage: 'Locale config generated successfully',
      data,
    };
  }
}
