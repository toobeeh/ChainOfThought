import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class PostDto {

    @ApiProperty()
    hash: string

    @ApiProperty()
    authorAddress: string

    @ApiProperty()
    timestamp: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    icon: string;

    @ApiProperty()
    psHash: string;
}