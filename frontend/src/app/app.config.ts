import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {ApiModule, Configuration, ConfigurationParameters} from "../../api";
import {environment} from "../environments/environment";
import {provideHttpClient} from "@angular/common/http";
import {Web3Service} from "./service/web3.service";

const apiConfigFactory = () => {
  const params: ConfigurationParameters = {
    basePath: environment.contentApiUrl,
    credentials: {
      "bearer": () => Web3Service.getCurrentToken()
    }
  };
  return new Configuration(params);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideHttpClient()
  ]
};
