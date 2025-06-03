// swagger.ts
import {writeFileSync} from "fs";
import {createApp} from "../src/factory";

async function generateSwagger() {
    const {documentFactory, app} = await createApp();
    const document = documentFactory();
    writeFileSync('./dist/openapi.json', JSON.stringify(document, null, 2));

    await app.close();
}

generateSwagger();
