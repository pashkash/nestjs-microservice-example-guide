import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import pjson = require('pjson');
import { ConfigServiceInterface, CONFIG_SERVICE_INTERFACE_TOKEN } from '@custom/nestjs-config';

export class SwaggerDocumentBuilder {
  static create(app: INestApplication): OpenAPIObject {
    const configService = app.get<ConfigServiceInterface>(
      CONFIG_SERVICE_INTERFACE_TOKEN,
    );

    const options = new DocumentBuilder()
      .setTitle(pjson?.config['swagger']['title'] || '')
      .setDescription(pjson?.config['swagger']['description'] || '')
      .setLicense(pjson.license, '')
      .setVersion(pjson.version)
      .addTag('v1')
      .addTag('monitoring')
      .addServer(
        `http://${configService.get<string>('app.host')}:${configService.get<
          string
        >('app.port')}`,
      )
      .addServer(`http://localhost:${configService.get<string>('app.port')}`)
      .build();

    return SwaggerModule.createDocument(app, options);
  }
}
