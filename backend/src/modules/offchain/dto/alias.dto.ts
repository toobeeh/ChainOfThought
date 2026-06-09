import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class AliasDto {

    @ApiProperty()
    alias: string;
}