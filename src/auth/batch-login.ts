import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:3000/auth/login-admin';

async function batchLogin(count = 100, batchSize = 20) {
  const results: AxiosResponse<any>[] = [];

  for (let i = 0; i < count; i += batchSize) {
    const batch: Promise<AxiosResponse<any>>[] = [];

    for (let j = i; j < i + batchSize && j < count; j++) {
      batch.push(
        axios.post(API_URL, {
          email: 'tnhosu@gmail.com',
          password: 'tnhosus3105',
          authType: 'ADMIN',
        }),
      );
    }

    // Chờ batch này xong trước khi chạy batch tiếp
    const batchRes = await Promise.allSettled(batch);

    batchRes.forEach((r) => {
      if (r.status === 'fulfilled') {
        const body = r.value.data;

        if (body.resultCode === '00') {
          console.log('Thành công');
        } else {
          console.log('Thất bại logic:', body.resultMessage);
        }
      } else {
        console.log('Request lỗi:', r.reason?.message || r.reason);
      }
    });

    results.push(
      ...batchRes
        // .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<AxiosResponse<any>>).value),
    );
  }

  return results;
}

batchLogin(10000).then(() => console.log('Batch login xong!'));
