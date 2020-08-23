import { BootstrapConsole } from 'nestjs-console';
import { MainModule } from './MainModule';

const bootstrap = new BootstrapConsole({
  module: MainModule,
  useDecorators: true,
});
bootstrap.init().then(async (app) => {
  try {
    // init your app
    await app.init();
    // boot the cli
    await bootstrap.boot();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
});
