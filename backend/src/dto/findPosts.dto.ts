import {ApiProperty} from "@nestjs/swagger";

export class FindPostsDto {

    @ApiProperty()
    hashes: string[];
}