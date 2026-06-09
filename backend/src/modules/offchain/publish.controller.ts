import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {PostDto} from "../content/dto/post.dto";
import {CostDto} from "./dto/cost.dto";
import {DraftDto} from "./dto/draft.dto";
import {OffchainDataService} from "./offchain-data.service";
import {IAuthService} from "../../service/auth.service.interface";

@Controller("publish")
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PublishController {
    constructor(
        @Inject(OffchainDataService) private readonly offchainDataService: OffchainDataService,
        @Inject(IAuthService) private readonly authService: IAuthService
    ) {}

    @Post("estimate")
    @ApiResponse({type: CostDto})
    async estimatePostCost(@Body() draft: DraftDto): Promise<CostDto> {
        const cost = await this.offchainDataService.estimatePostCost(draft);
        return {cost};
    }

    @Post("publish")
    @ApiResponse({type: PostDto})
    async postDraft(@Body() draft: DraftDto): Promise<PostDto> {
        return await this.offchainDataService.publishDraft(this.authService.authenticatedAddress, draft);
    }
}
