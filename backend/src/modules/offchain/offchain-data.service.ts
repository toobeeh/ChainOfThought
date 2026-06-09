import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {AccessEntity} from "./entities/access.entity";
import {AliasEntity} from "./entities/alias.entity";
import {BalanceEntity} from "./entities/balance.entity";
import {FavoriteEntity} from "./entities/favorite.entity";
import {PostInfoEntity} from "./entities/post-info.entity";
import {RewardEntity} from "./entities/reward.entity";
import {UserDto} from "./dto/user.dto";
import {config} from "../../config";
import {DraftDto} from "./dto/draft.dto";
import {PostDto} from "../content/dto/post.dto";
import {StatsDto} from "./dto/stats.dto";
import * as crypto from "crypto";

@Injectable()
export class OffchainDataService {
    constructor(
        @InjectRepository(AccessEntity) private accessRepository: Repository<AccessEntity>,
        @InjectRepository(AliasEntity) private aliasRepository: Repository<AliasEntity>,
        @InjectRepository(BalanceEntity) private balanceRepository: Repository<BalanceEntity>,
        @InjectRepository(FavoriteEntity) private favoriteRepository: Repository<FavoriteEntity>,
        @InjectRepository(PostInfoEntity) private postInfoRepository: Repository<PostInfoEntity>,
        @InjectRepository(RewardEntity) private rewardRepository: Repository<RewardEntity>
    ) { }

    public async getUserById(id: string): Promise<UserDto> {
        const rewardAvailable = await this.rewardRepository.findOneBy({author: id});
        const alias = await this.aliasRepository.findOneBy({author: id});
        const balance = await this.balanceRepository.findOneBy({id: id});

        const now = Date.now();

        return {
            rewardAvailable: rewardAvailable === null || rewardAvailable.timestamp + config.offchainConfig.rewardInterval * 1000 < now,
            alias: alias?.alias,
            balance: balance === null ? 0 : balance.balance
        }
    }

    public async claimReward(id: string) {
        const reward = await this.rewardRepository.findOneBy({author: id});
        const now = Date.now();
        if (reward === null) {
            const newReward = new RewardEntity();
            newReward.author = id;
            newReward.timestamp = now;
            await this.rewardRepository.save(newReward);
        } else {
            if (reward.timestamp + config.offchainConfig.rewardInterval * 1000 > now) {
                throw new Error("Reward not available yet");
            }
            reward.timestamp = now;
            await this.rewardRepository.save(reward);
        }

        let balance = await this.balanceRepository.findOneBy({id: id});
        if (balance === null) {
            balance = new BalanceEntity();
            balance.id = id;
            balance.balance = config.offchainConfig.rewardAmount;
        } else {
            balance.balance += config.offchainConfig.rewardAmount;
        }
        await this.balanceRepository.save(balance);
    }

    public async changeAlias(id: string, alias: string) {
        const balance = await this.balanceRepository.findOneBy({id: id});
        if (balance === null || balance.balance < config.offchainConfig.renamePrice) {
            throw new Error("Not enough balance to change alias");
        }

        let aliasEntity = await this.aliasRepository.findOneBy({author: id});
        if (aliasEntity === null) {
            aliasEntity = new AliasEntity();
            aliasEntity.author = id;
        }

        balance.balance -= config.offchainConfig.renamePrice;
        await this.balanceRepository.save(balance);

        aliasEntity.alias = alias;
        await this.aliasRepository.save(aliasEntity);
    }

    public async estimatePostCost(draft: DraftDto) {
        const iconCost = draft.icon === undefined ? 0 : config.offchainConfig.iconPrice;
        const contentCost = draft.content.length;
        const titleCost = draft.title.length;
        return iconCost + contentCost + titleCost;
    }

    calculatePostHash(post: PostDto): string {
        const stringifiedContent = JSON.stringify({
            title: post.title,
            content: post.content,
            timestamp: post.timestamp,
            authorAddress: post.authorAddress,
            icon: post.icon,
            psHash: post.psHash
        });
        const hash = crypto.createHash('sha256');
        hash.update(stringifiedContent);
        const contentHash = hash.digest('hex');
        return "0x" + contentHash;
    }

    public async publishDraft(id: string, draft: DraftDto): Promise<PostDto> {
        const cost = await this.estimatePostCost(draft);
        const balance = await this.balanceRepository.findOneBy({id: id});
        if (balance === null || balance.balance < cost) {
            throw new Error("Not enough balance to publish post");
        }

        balance.balance -= cost;
        await this.balanceRepository.save(balance);

        const timestamp = Date.now();
        const post: PostDto = {
            hash: "", // calculate next
            authorAddress: id,
            timestamp: timestamp,
            title: draft.title,
            content: draft.content,
            icon: draft.icon ?? "",
            psHash: draft.psHash ?? ""
        }

        const postInfo = new PostInfoEntity();
        postInfo.hash = this.calculatePostHash(post);
        postInfo.author = id;
        postInfo.hidden = false;
        postInfo.referencedHash = draft.psHash;
        await this.postInfoRepository.save(postInfo);

        const postHash = this.calculatePostHash(post);
        post.hash = postHash;

        return post;
    }

    public async getAllPostHashes(): Promise<string[]> {
        const postInfos = await this.postInfoRepository.find();
        return postInfos.map(info => info.hash);
    }

    public async getPostStats(hash: string): Promise<StatsDto> {
        const info = await this.postInfoRepository.findOneBy({hash});

        if (info === null) {
            throw new Error("Post not found");
        }

        const accesses = await this.accessRepository.findBy({hash});
        const favorites = await this.favoriteRepository.findBy({hash});
        const references = await this.postInfoRepository.findBy({referencedHash: hash});

        return {
            accesses: accesses.length,
            favorites: favorites.length,
            references: references.map(ref => ref.hash),
            referencedPost: info.referencedHash,
            author: info.author,
            hidden: info.hidden
        }
    }

    public async getUserFavorites(id: string): Promise<string[]> {
        const favorites = await this.favoriteRepository.findBy({author: id});
        return favorites.map(fav => fav.hash);
    }

    public async getUserAccesses(id: string): Promise<string[]> {
        const accesses = await this.accessRepository.findBy({author: id});
        return accesses.map(access => access.hash);
    }

    public async getUserWritten(id: string): Promise<string[]> {
        const postInfos = await this.postInfoRepository.findBy({author: id});
        return postInfos.map(info => info.hash);
    }

    public async getUserAccessAllowed(id: string): Promise<string[]> {
        const accesses = await this.accessRepository.findBy({author: id});
        const postInfos = await this.postInfoRepository.findBy({author: id});
        const allIds = [...new Set([...accesses.map(access => access.hash), ...postInfos.map(info => info.hash)])];
        return allIds;
    }

    public async accessPost(id: string, hash: string) {
        if(await this.accessRepository.findOneBy({author: id, hash}) !== null){
            throw new Error("Post already accessed");
        }

        const balance = await this.balanceRepository.findOneBy({id: id});
        if (balance === null || balance.balance < config.offchainConfig.accessPrice) {
            throw new Error("Not enough balance to access post");
        }

        balance.balance -= config.offchainConfig.accessPrice;
        await this.balanceRepository.save(balance);

        const access = new AccessEntity();
        access.author = id;
        access.hash = hash;
        await this.accessRepository.save(access);
    }

    public async favoritePost(id: string, hash: string) {
        if(await this.favoriteRepository.findOneBy({author: id, hash}) !== null){
            throw new Error("Post already favorited");
        }

        const balance = await this.balanceRepository.findOneBy({id: id});
        if (balance === null || balance.balance < config.offchainConfig.favoritePrice) {
            throw new Error("Not enough balance to favorite post");
        }

        balance.balance -= config.offchainConfig.favoritePrice;
        await this.balanceRepository.save(balance);

        const favorite = new FavoriteEntity();
        favorite.author = id;
        favorite.hash = hash;
        await this.favoriteRepository.save(favorite);
    }

    public async hidePost(hash: string) {
        const postInfo = await this.postInfoRepository.findOneBy({hash});
        if (postInfo === null) {
            throw new Error("Post not found");
        }
        postInfo.hidden = true;
        await this.postInfoRepository.save(postInfo);
    }

}