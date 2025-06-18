import {Module} from '@nestjs/common';
import {ContentModule} from "./modules/content/content.module";
import {getBackendModule} from "./backendModuleFactory";

@Module({
  imports: [
      ContentModule,
      getBackendModule()
  ],
  providers: [],
})
export class AppModule {}

