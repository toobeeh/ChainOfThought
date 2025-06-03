import { SwaggerModule, } from '@nestjs/swagger';
import {createApp} from "./factory";

async function bootstrap() {
  const {app, documentFactory} = await createApp();
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: "openapi.json"
  });
  await app.listen(3000);
}

bootstrap();
