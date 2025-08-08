import progress from '../../api/progress';

export const handler = async (event: any) => {
  const url = new URL(event.rawUrl);
  const body = event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString() : event.body;

  const headers: Record<string, string> = { ...(event.headers as any) };

  const req = new Request(url.toString(), {
    method: event.httpMethod,
    headers: headers as any,
    body,
  });

  const res = await progress(req);
  const text = await res.text();

  const outHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => (outHeaders[key] = value));

  return {
    statusCode: res.status,
    headers: outHeaders,
    body: text,
  };
};