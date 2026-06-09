import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class PostHashDto {

    @ApiProperty()
    hash: string;
}