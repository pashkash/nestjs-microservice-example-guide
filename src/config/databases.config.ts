import { registerAs } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';
import postgresConfig from './postgres.config';

export default registerAs(
  'databases',
  (): Record<string, ConnectionOptions> => {
    return {
      postgres: postgresConfig,
    };
  },
);
