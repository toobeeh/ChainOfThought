import {ApiProperty} from "@nestjs/swagger";

export class PostPreviewDto {

    @ApiProperty()
    hash: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    authorAddress: string;

    @ApiProperty()
    timestamp: number;

    @ApiProperty()
    icon: string;
}