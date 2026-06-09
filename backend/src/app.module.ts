import {Module} from '@nestjs/common';
import {ContentModule} from "./modules/content/content.module";
import {getBackendModule} from "./backendModuleFactory";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
      TypeOrmModule.forRoot({
          type: "sqlite",
          database: "./data/thoughtcloud-content.db",
          autoLoadEntities: true,
          synchronize: true
      }),
      ContentModule,
      getBackendModule()
  ],
  providers: [],
})
export class AppModule {}

