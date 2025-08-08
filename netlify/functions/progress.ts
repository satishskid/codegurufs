import progress from '../../api/progress';

export const handler = async (event: any) => {
  const url = new URL(event.rawUrl);
  const body = event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString() : event.body;

  const req = new Request(url.toString(), {
    method: event.httpMethod,
    headers: event.headers as any,
    body,
  });

  const res = await progress(req);
  const text = await res.text();

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => (headers[key] = value));

  return {
    statusCode: res.status,
    headers,
    body: text,
  };
};