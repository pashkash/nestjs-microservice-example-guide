import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs('services', () => {
  return {
    redis: {
      name: process.env.REDIS_MASTER_NAME,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : 6379,
      sentinels:
        (process.env.REDIS_SENTINELS &&
          JSON.parse(process.env.REDIS_SENTINELS)) ||
        undefined,
    } as RedisOptions,
    sentry: {
      dsn: process.env.SENTRY_DSN || null,
    },
  };
});
