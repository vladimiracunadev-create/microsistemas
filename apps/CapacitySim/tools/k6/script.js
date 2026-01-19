import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '2m', target: 800 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% < 800ms
    http_req_failed: ['rate<0.01'],   // < 1% errores
  }
};

const TARGET_URL = __ENV.TARGET_URL || 'https://example.org/';

export default function () {
  const res = http.get(TARGET_URL);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(Math.random() * 2);
}
