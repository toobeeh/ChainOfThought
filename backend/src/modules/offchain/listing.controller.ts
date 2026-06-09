import {
    Controller,
    ForbiddenException,
    Get, Inject,
    Param,
    Post,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {PostHashDto} from "./dto/post-hash.dto";
import {StatsDto} from "./dto/stats.dto";
import {IAuthService} from "../../service/auth.service.interface";
import {OffchainDataService} from "./offchain-data.service";
import {config} from "../../config";
import {SettingsDto} from "./dto/settings.dto";

@Controller("posts")
export class ListingController {
    constructor(
        @Inject(IAuthService) private readonly authService: IAuthService,
        @Inject(OffchainDataService) private readonly offchainDataService: OffchainDataService
    ) {}

    @Get()
    @ApiResponse({type: [PostHashDto]})
    async findPosts(): Promise<PostHashDto[]> {
        const hashes = await this.offchainDataService.getAllPostHashes();
        return hashes.map(hash => ({hash}));
    }

    @Get(":hash/stats")
    @ApiResponse({type: StatsDto})
    async getPostStats(@Param("hash") hash: string): Promise<StatsDto> {
        return await this.offchainDataService.getPostStats(hash);
    }

    @Get("favorites")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({type: [PostHashDto]})
    async getFavorites(): Promise<PostHashDto[]> {
        const hashes = await this.offchainDataService.getUserFavorites(this.authService.authenticatedAddress);
        return hashes.map(hash => ({hash}));
    }

    @Get("accesses")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({type: [PostHashDto]})
    async getAccesses(): Promise<PostHashDto[]> {
        const hashes = await this.offchainDataService.getUserAccesses(this.authService.authenticatedAddress);
        return hashes.map(hash => ({hash}));
    }

    @Get("written")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({type: [PostHashDto]})
    async getWritten(): Promise<PostHashDto[]> {
        const hashes = await this.offchainDataService.getUserWritten(this.authService.authenticatedAddress);
        return hashes.map(hash => ({hash}));
    }

    @Get("allowed")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({type: [PostHashDto]})
    async getUserAccessAllowed(): Promise<PostHashDto[]> {
        const hashes = await this.offchainDataService.getUserAccessAllowed(this.authService.authenticatedAddress);
        return hashes.map(hash => ({hash}));
    }

    @Post(":hash/access")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async accessPost(@Param("hash") hash: string) {
        await this.offchainDataService.accessPost(this.authService.authenticatedAddress, hash);
    }

    @Post(":hash/favorite")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async favoritePost(@Param("hash") hash: string) {
        await this.offchainDataService.favoritePost(this.authService.authenticatedAddress, hash);
    }

    @Post(":hash/hide")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async hidePost(@Param("hash") hash: string) {
        if(!config.offchainConfig.moderatorIds.includes(this.authService.authenticatedAddress)){
            throw new ForbiddenException("Only moderators can hide posts");
        }

        await this.offchainDataService.hidePost(hash);
    }

    @Post("settings")
    @ApiResponse({type: SettingsDto})
    async getSettings(): Promise<SettingsDto> {
        return {
            rewardTime: config.offchainConfig.rewardInterval,
            rewardAmount: config.offchainConfig.rewardAmount,
            renamePrice: config.offchainConfig.renamePrice,
            accessPrice: config.offchainConfig.accessPrice
        }
    }
}
