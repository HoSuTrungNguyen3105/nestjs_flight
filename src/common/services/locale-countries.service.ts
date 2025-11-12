import { Injectable } from '@nestjs/common';
import axios from 'axios';

type CountryData = {
  country?: string;
  flag?: string;
};

@Injectable()
export class LocaleService {
  private LOCALE_MAP = {
    ko: { locale: 'ko-KR', name: '한국어' },
    vi: { locale: 'vi-VN', name: 'Tiếng Việt' },
    en: { locale: 'en-US', name: 'English' },
    jp: { locale: 'ja-JP', name: '日本語' },
  };

  private LANGUAGE_COUNTRY_MAP = {
    ko: 'KR',
    vi: 'VN',
    en: 'US',
    jp: 'JP',
  };

  private CURRENCY_SYMBOLS = {
    JPY: '¥',
    VND: '₫',
    USD: '$',
    KRW: '₩',
  };

  async buildLocaleConfig(language: string, currency: string) {
    const langData = this.LOCALE_MAP[language] || this.LOCALE_MAP.en;
    const countryCode = this.LANGUAGE_COUNTRY_MAP[language] || 'US';

    let countryData: CountryData | null = null;

    try {
      const res = await axios.get(
        `https://restcountries.com/v3.1/alpha/${countryCode}`,
      );
      if (Array.isArray(res.data) && res.data.length > 0) {
        countryData = {
          country: res.data[0].name?.common,
          flag: res.data[0].flags?.svg || res.data[0].flags?.png,
        };
      } else if (res.data && res.data.name) {
        // nếu API trả về object thay vì array
        countryData = {
          country: res.data.name?.common,
          flag: res.data.flags?.svg || res.data.flags?.png,
        };
      }
    } catch (err) {
      console.warn('Could not fetch country data:', err);
    }

    const displayName = new Intl.DisplayNames([langData.locale], {
      type: 'currency',
    }).of(currency);
    const symbol = this.CURRENCY_SYMBOLS[currency] || currency;

    return {
      locale: langData.locale,
      language: {
        code: language,
        name: langData.name,
      },
      currency: {
        code: currency,
        symbol,
        displayName,
      },
      logo: {
        // url: langData.logo,
        alt: `Logo (${langData.name})`,
      },
      country: countryData,
    };
  }
}
