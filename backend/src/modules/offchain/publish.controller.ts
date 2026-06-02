import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {IContentService} from "../../service/content.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {PostDto} from "../content/dto/post.dto";
import {CostDto} from "./dto/cost.dto";
import {DraftDto} from "./dto/draft.dto";
import {PostHashDto} from "./dto/post-hash.dto";

@Controller("publish")
@ApiBearerAuth()
export class PublishController {
    constructor(
        @Inject(IContentService) private readonly postService: IContentService,
        @Inject(IAccessService) private readonly postAccessService: IAccessService
    ) {}

    @Post("estimate")
    @ApiResponse({type: PostDto})
    async estimatePostCost(@Body() draft: DraftDto): Promise<CostDto> {
        // TODO
    }

    @Post("publish")
    @UseGuards(AuthGuard)
    @ApiResponse({type: PostDto})
    async postDraft(@Body() draft: DraftDto): Promise<PostHashDto> {
        // TODO
    }
}
