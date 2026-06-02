import {
    Body,
    Controller,
    ForbiddenException,
    Get, Inject,
    NotFoundException,
    Param,
    Post,
    PreconditionFailedException,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {IContentService} from "../../service/content.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {PostDto} from "../content/dto/post.dto";
import {FindPostsDto} from "../content/dto/findPosts.dto";
import {PostPreviewDto} from "../content/dto/postPreview.dto";
import {CostDto} from "./dto/cost.dto";
import {DraftDto} from "./dto/draft.dto";
import {PostHashDto} from "./dto/post-hash.dto";
import {StatsDto} from "./dto/stats.dto";

@Controller("posts")
@ApiBearerAuth()
export class ListingController {
    constructor(
        @Inject(IContentService) private readonly postService: IContentService,
        @Inject(IAccessService) private readonly postAccessService: IAccessService
    ) {}

    @Get()
    @ApiResponse({type: [PostHashDto]})
    async findPosts(): Promise<PostHashDto[]> {
        // TODO
    }

    @Get(":hash/stats")
    @ApiResponse({type: StatsDto})
    async estimatePostCost(@Param("hash") hash: string): Promise<StatsDto> {
        // TODO
    }

    @Get("favorites")
    @UseGuards(AuthGuard)
    @ApiResponse({type: [PostHashDto]})
    async getFavorites(): Promise<PostHashDto[]> {
        // TODO
    }

    @Get("accesses")
    @UseGuards(AuthGuard)
    @ApiResponse({type: [PostHashDto]})
    async getAccesses(): Promise<PostHashDto[]> {
        // TODO
    }

    @Get("written")
    @UseGuards(AuthGuard)
    @ApiResponse({type: [PostHashDto]})
    async getWritten(): Promise<PostHashDto[]> {
        // TODO
    }

    @Get("allowed")
    @UseGuards(AuthGuard)
    @ApiResponse({type: [PostHashDto]})
    async getUserAccessAllowed(): Promise<PostHashDto[]> {
        // TODO
    }

    @Post(":hash/access")
    @UseGuards(AuthGuard)
    async accessPost(@Param("hash") hash: string) {
        // TODO
    }

    @Post(":hash/favorite")
    @UseGuards(AuthGuard)
    async favoritePost(@Param("hash") hash: string) {
        // TODO
    }

    @Post(":hash/hide")
    @UseGuards(AuthGuard)
    async hidePost(@Param("hash") hash: string) {
        // TODO
    }
}
