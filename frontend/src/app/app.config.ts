import {ApplicationConfig, importProvidersFrom, inject, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {ApiModule, Configuration, ConfigurationParameters} from "../../api";
import {environment} from "../environments/environment";
import {provideHttpClient} from "@angular/common/http";
import {BackendSelectorService} from "./service/backend-selector.service";
import {IAuthorService} from "./service/author.service.interface";
import {AuthorService} from "./service/onchain/author.service";
import {OffchainAuthorService} from "./service/offchain/offchain-author.service";
import {IPostsService} from "./service/posts.service.interface";
import {PostsService} from "./service/onchain/posts.service";
import {OffchainPostsService} from "./service/offchain/offchain-posts.service";
import {IAuthService} from "./service/auth.service.interface";
import {Web3Service} from "./service/onchain/web3.service";
import {OffchainCryptoService} from "./service/offchain/offchain-crypto.service";

const apiConfigFactory = () => {
  const auth = inject<IAuthService>(IAuthService);
  const params: ConfigurationParameters = {
    basePath: environment.contentApiUrl,
    credentials: {
      "bearer": () => auth.getCurrentToken()
    }
  };
  return new Configuration(params);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideHttpClient(),
    {
      provide: IAuthService,
      deps: [BackendSelectorService],
      useFactory: (selector: BackendSelectorService) =>
          selector.buildBackend(Web3Service, OffchainCryptoService)
    },
    {
      provide: IAuthorService,
      deps: [BackendSelectorService],
      useFactory: (selector: BackendSelectorService) =>
          selector.buildBackend(AuthorService, OffchainAuthorService)
    },
    {
      provide: IPostsService,
      deps: [BackendSelectorService],
      useFactory: (selector: BackendSelectorService) =>
          selector.buildBackend(PostsService, OffchainPostsService)
    }
  ]
};
