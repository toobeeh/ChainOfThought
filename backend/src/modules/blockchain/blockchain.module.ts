import {Module, Provider} from "@nestjs/common";
import {IAuthService} from "../../service/auth.service.interface";
import {BlockchainAuthService} from "./blockchain-auth.service";
import {IAccessService} from "../../service/access.service.interface";
import {BlockchainPostAccessService} from "./blockchain-post-access.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";

const services: Provider[] = [
    { provide: IAuthService, useClass: BlockchainAuthService },
    { provide: IAccessService, useClass: BlockchainPostAccessService }
]

@Module({
    controllers: [],
    providers: [
        ...services,
        ChainOfThoughtService
    ],
    exports: [
        ...services
    ],
})
export class BlockchainModule { }