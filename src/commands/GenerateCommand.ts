import { Console, Command, ConsoleService } from 'nestjs-console';
import { SwaggerDocumentBuilder } from '../components/SwaggerDocumentBuilder';

@Console({ name: 'generate' })
export class GenerateCommand {
  constructor(private readonly consoleService: ConsoleService) {}

  @Command({
    command: 'open-api-schema',
  })
  async openApiSchema(): Promise<void> {
    process.stdout.write(
      JSON.stringify(
        SwaggerDocumentBuilder.create(
          this.consoleService.getContainer() as any,
        ),
      ),
      'utf8',
    );
  }
}
