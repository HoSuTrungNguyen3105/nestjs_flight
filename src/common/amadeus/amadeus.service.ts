import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
  private clientId = process.env.AMADEUS_CLIENT_ID;
  private clientSecret = process.env.AMADEUS_CLIENT_SECRET;

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

  async fetchAllAirports() {
    const token = await this.getToken();
    const airports: AmadeusAirport[] = [];

    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    for (const letter of alphabet) {
      const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${letter}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        airports.push(...res.data.data);
      }
    }

    return airports;
  }
}
