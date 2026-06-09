import {
    Body,
    Controller,
    Get, Inject,
    Param, Patch,
    Post, UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {UserDto} from "./dto/user.dto";
import {IAuthService} from "../../service/auth.service.interface";
import {OffchainDataService} from "./offchain-data.service";
import {AliasDto} from "./dto/alias.dto";

@Controller("user")
export class UserController {
    constructor(
        @Inject(IAuthService) private readonly authService: IAuthService,
        @Inject(OffchainDataService) private readonly offchainDataService: OffchainDataService
    ) {}

    @Get(":id")
    @ApiResponse({type: UserDto})
    async getUser(@Param("id") id: string): Promise<UserDto> {
        return this.offchainDataService.getUserById(id);
    }

    @Post(":id/claim")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async claimReward(@Param("id") id: string) {
        if(id !== this.authService.authenticatedAddress) {
            throw new UnauthorizedException("Cannot access foreign user data");
        }

        await this.offchainDataService.claimReward(id);
    }

    @Patch(":id/alias")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async changeAlias(@Param("id") id: string, @Body() alias: AliasDto) {
        if(id !== this.authService.authenticatedAddress) {
            throw new UnauthorizedException("Cannot access foreign user data");
        }

        await this.offchainDataService.changeAlias(id, alias.alias);
    }
}
