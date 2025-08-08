import adminApi from '../../api/admin';

export const handler = async (event: any) => {
  const body = event.isBase64Encoded && event.body
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;

  const req = new Request(event.rawUrl, {
    method: event.httpMethod,
    headers: event.headers as any,
    body,
  });

  const res = await adminApi(req);
  const text = await res.text();

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => (headers[key] = value));

  return {
    statusCode: res.status,
    headers,
    body: text,
  };
};
