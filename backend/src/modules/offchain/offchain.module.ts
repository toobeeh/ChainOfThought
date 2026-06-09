import {Module, Provider} from "@nestjs/common";
import {IAuthService} from "../../service/auth.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {OffchainAuthService} from "./offchain-auth.service";
import {OffchainPostAccessService} from "./offchain-post-access.service";
import {OffchainDataService} from "./offchain-data.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AliasEntity} from "./entities/alias.entity";
import {AccessEntity} from "./entities/access.entity";
import {BalanceEntity} from "./entities/balance.entity";
import {FavoriteEntity} from "./entities/favorite.entity";
import {PostInfoEntity} from "./entities/post-info.entity";
import {RewardEntity} from "./entities/reward.entity";
import {ListingController} from "./listing.controller";
import {PublishController} from "./publish.controller";
import {UserController} from "./user.controller";

const services: Provider[] = [
    { provide: IAuthService, useClass: OffchainAuthService },
    { provide: IAccessService, useClass: OffchainPostAccessService },
    OffchainDataService
]

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AliasEntity, AccessEntity, BalanceEntity, FavoriteEntity, PostInfoEntity, RewardEntity
        ])
    ],
    controllers: [
        ListingController,
        PublishController,
        UserController
    ],
    providers: [
        ...services
    ],
    exports: [
        ...services
    ],
})
export class OffchainModule { }