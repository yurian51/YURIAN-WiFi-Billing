import { randomUUID } from 'node:crypto';

export class RequestIdMiddleware {
  use(req: any, res: any, next: () => void) {
    const incoming = typeof req.headers?.['x-request-id'] === 'string'
      ? req.headers['x-request-id'].trim()
      : '';
    const requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
