import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalHotelService {
  //   constructor(private readonly http: HttpService) {}

  async getHotelsFromAmadeus(cityid: number) {
    const response = await axios.get(
      `https://api.makcorps.com/city?cityid=${cityid}&pagination=0&cur=USD&rooms=1&adults=2&checkin=2025-12-25&checkout=2025-12-26&api_key=${process.env.HOTEL_API_KEY}`,
    );

    return response.data.data.map((h) => ({
      externalSource: 'AMADEUS',
      externalId: h.hotelId,
      name: h.name,
      city: cityid,
      address: h.address?.lines?.join(', '),
      rating: h.rating || 0,
      distanceToCenter: h.distance?.value || 0,
      imageUrl: h.media?.[0]?.uri || null,
      price: h.offers?.[0]?.price?.total || 0,
      isImported: true,
    }));
  }
}
