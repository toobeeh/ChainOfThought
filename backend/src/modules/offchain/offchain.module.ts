import {Module, Provider} from "@nestjs/common";
import {IAuthService} from "../../service/auth.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {OffchainAuthService} from "./offchain-auth.service";
import {OffchainPostAccessService} from "./offchain-post-access.service";

const services: Provider[] = [
    { provide: IAuthService, useClass: OffchainAuthService },
    { provide: IAccessService, useClass: OffchainPostAccessService }
]

@Module({
    controllers: [],
    providers: [
        ...services
    ],
    exports: [
        ...services
    ],
})
export class OffchainModule { }