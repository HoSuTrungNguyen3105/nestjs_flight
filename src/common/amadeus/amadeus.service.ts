import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';

type AmadeusAirport = {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
  };
};

@Injectable()
export class AmadeusService {
  constructor(private prisma: PrismaService) {}

  private clientId = process.env.AMADEUS_CLIENT_ID;
  private clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  private cache: AmadeusAirport[] | null = null;

  private async getToken() {
    const res = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId as string,
        client_secret: this.clientSecret as string,
      }),
    );
    return res.data.access_token;
  }

  private async requestWithRetry(
    url: string,
    token: string,
    retries = 5,
    delay = 1000,
  ) {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 429 && retries > 0) {
        // nếu bị rate limit thì delay và retry
        await new Promise((r) => setTimeout(r, delay));
        return this.requestWithRetry(url, token, retries - 1, delay * 2); // exponential backoff
      }
      throw err;
    }
  }

  async fetchAndImportAirports() {
    const token = await this.getToken();
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const airports: AmadeusAirport[] = [];

    for (const letter of alphabet) {
      const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${letter}`;
      const res = await this.requestWithRetry(url, token);
      if (res?.data) airports.push(...res.data);
      // delay 500ms giữa các request để tránh 429
      await new Promise((r) => setTimeout(r, 500));
    }

    // Lưu vào DB
    const timestamp = Date.now(); // dùng cho createdAt Decimal
    for (const airport of airports) {
      await this.prisma.airport.upsert({
        where: { code: airport.iataCode },
        update: {
          name: airport.name,
          city: airport.address?.cityName ?? '',
          country: airport.address?.countryName ?? '',
          updatedAt: timestamp,
        },
        create: {
          code: airport.iataCode,
          name: airport.name,
          city: airport.address?.cityName ?? '',
          country: airport.address?.countryName ?? '',
          createdAt: timestamp,
        },
      });
    }

    return {
      message: 'Imported airports successfully',
      count: airports.length,
    };
  }

  async fetchAllAirports() {
    if (this.cache) return this.cache; // trả về cache nếu đã fetch lần trước

    const token = await this.getToken();
    const airports: AmadeusAirport[] = [];
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    for (const letter of alphabet) {
      const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${letter}`;
      const res = await this.requestWithRetry(url, token);
      if (res?.data) airports.push(...res.data);

      // delay 500ms giữa các request
      await new Promise((r) => setTimeout(r, 500));
    }

    this.cache = airports; // lưu vào cache memory
    return airports;
  }
}
