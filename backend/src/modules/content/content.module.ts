import {Module, Provider} from "@nestjs/common";
import {IContentService} from "../../service/content.service.interface";
import {ContentService} from "./content.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostContentEntity} from "./entities/post-content.entity";
import {ContentController} from "./content.controller";
import {getBackendModule} from "../../backendModuleFactory";

const services: Provider[] = [
    { provide: IContentService, useClass: ContentService }
]

@Module({
    imports: [
        TypeOrmModule.forFeature([PostContentEntity]),
        getBackendModule()
    ],
    controllers: [
        ContentController
    ],
    providers: [
        ...services
    ],
    exports: [
        ...services
    ],
})
export class ContentModule { }