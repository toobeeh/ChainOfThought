import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

export async function createApp() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('ThoughtCloud')
        .setDescription('Content service for Chain Of Thought')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);

    return {documentFactory, app}
}