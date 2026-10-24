type HeaderMap = Record<string, any>;

const AUTH_HEADERS = new Set(['authorization', 'proxy-authorization']);
const FULLY_MASKED_HEADERS = new Set([
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'x-access-token',
]);

/** คงตัวอักษรต้นและท้ายไว้ ส่วนตรงกลางแทนด้วย *** */
const keepStartEnd = (value: string, keepStart: number, keepEnd: number): string => {
  if (value.length <= keepStart + keepEnd) {
    return '***';
  }

  return `${value.slice(0, keepStart)}***${value.slice(-keepEnd)}`;
};

const maskValue = (key: string, value: any): any => {
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(key, item));
  }

  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  const header = key.toLowerCase();

  if (AUTH_HEADERS.has(header)) {
    const [scheme, ...rest] = value.split(' ');
    const token = rest.join(' ');

    // ไม่มี scheme เช่น ส่ง token มาตรง ๆ
    if (!token) {
      return keepStartEnd(value, 1, 4);
    }

    return `${scheme} ${keepStartEnd(token, 1, 4)}`;
  }

  if (FULLY_MASKED_HEADERS.has(header)) {
    return '***';
  }

  return value;
};

/**
 * ปิดข้อมูลอ่อนไหวใน headers ก่อนเขียนลง log
 * - authorization/proxy-authorization: คง scheme ไว้ เช่น `Bearer a***cdef`
 * - cookie/set-cookie/api key: แทนด้วย `***`
 * - header อื่น ๆ: คงค่าเดิม
 */
export const maskHeaders = (headers: HeaderMap | null | undefined): HeaderMap => {
  if (!headers) {
    return {};
  }

  const result: HeaderMap = {};

  for (const [key, value] of Object.entries(headers)) {
    result[key] = maskValue(key, value);
  }

  return result;
};
