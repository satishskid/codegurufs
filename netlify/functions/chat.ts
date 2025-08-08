import chat from '../../api/chat';

export const handler = async (event: any) => {
  const body = event.isBase64Encoded && event.body
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;

  // Ensure Authorization header is forwarded as-is
  const headers: Record<string, string> = { ...(event.headers as any) };

  const req = new Request(event.rawUrl, {
    method: event.httpMethod,
    headers: headers as any,
    body,
  });

  const res = await chat(req);
  const text = await res.text();

  const outHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => (outHeaders[key] = value));

  return {
    statusCode: res.status,
    headers: outHeaders,
    body: text,
  };
};