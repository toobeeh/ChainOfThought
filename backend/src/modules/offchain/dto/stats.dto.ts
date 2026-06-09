import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class StatsDto {

    @ApiProperty()
    favorites: number;

    @ApiProperty()
    accesses: number;

    @ApiProperty()
    references: string[];

    @ApiProperty({required: false})
    referencedPost?: string;

    @ApiProperty()
    author: string;

    @ApiProperty()
    hidden: boolean;
}