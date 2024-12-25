import { NextApiRequest, NextApiResponse } from 'next';
import { ZodSchema } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getToken } from 'next-auth/jwt';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export function withApiMiddleware(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>, schema?: ZodSchema) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Rate limiting
      const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const result = await ratelimit.limit(identifier as string);
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);

      if (!result.success) {
        return res.status(429).json({ error: 'Too Many Requests' });
      }

      // Input validation
      if (schema) {
        try {
          schema.parse(req.body);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid input' });
        }
      }

      // Authentication
      const token = await getToken({ req });
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Authorization (example)
      if (req.url?.startsWith('/api/admin') && token.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Call the actual handler
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

