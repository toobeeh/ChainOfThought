import {
    Controller,
    Get, Inject,
    Param, Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {IContentService} from "../../service/content.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {UserDto} from "./dto/user.dto";

@Controller("user")
@ApiBearerAuth()
export class UserController {
    constructor(
        @Inject(IContentService) private readonly postService: IContentService,
        @Inject(IAccessService) private readonly postAccessService: IAccessService
    ) {}

    @Get(":id")
    @ApiResponse({type: UserDto})
    async getUser(@Param("id") id: string): Promise<UserDto> {
        // TODO
    }

    @Post(":id/claim")
    @UseGuards(AuthGuard)
    async claimReward(@Param("id") id: string) {
        // TODO
    }

    @Patch(":id/alias")
    @UseGuards(AuthGuard)
    async changeAlias(@Param("id") id: string) {
        // TODO
    }
}
