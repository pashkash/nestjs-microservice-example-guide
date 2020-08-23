import { ConnectionOptions } from 'typeorm';
import path from 'path';

const postgresConfig: ConnectionOptions = {
  host: process.env.POSTGRES_HOST || '10.20.1.112',
  port: process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT, 10)
    : 5432,
  username: process.env.POSTGRES_USERNAME || 'local',
  password: process.env.POSTGRES_PASSWORD || 'local',
  database: process.env.POSTGRES_DATABASE || 'local',
  synchronize: false,
  type: 'postgres',
  entities: [path.join(__dirname, '/..') + '/**/*Entity{.ts,.js}'], // doesn't understand relative paths
  migrationsRun: true,
  migrations: [path.join(__dirname, '/..') + '/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = postgresConfig;
