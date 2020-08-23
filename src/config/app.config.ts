import { registerAs } from '@nestjs/config';
import pjson from 'pjson';
import os from 'os';

export default registerAs('app', () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.VERSION || pjson.version,
    host: process.env.APP_HOST || '0.0.0.0',
    port: process.env.APP_PORT|| 8888,
    debug: !!process.env.DEBUG,
    hostname: os.hostname(),
  };
});
