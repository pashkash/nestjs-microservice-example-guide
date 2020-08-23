import { registerAs } from '@nestjs/config';

export default registerAs('vault', () => {
  return {
    host: process.env.VAULT_HOST || 'http://127.0.0.1',
    port: Number(process.env.VAULT_PORT) || 8200,
    mountPoint: process.env.VAULT_MOUNT_POINT || 'settings',
    isEnabled: process.env.VAULT_IS_ENABLED.toLowerCase() === 'true' || true,
    test:
      'amqp://{{service/rabbitmq.user}}:{{service/rabbitmq.password}}@{{service/rabbitmq.hosts.0}}:{{service/rabbitmq.port}}',
    auth: {
      type: 'appRole',
      config: {
        role_id: '~',
        secret_id: '~',
      },
    },
  };
});
