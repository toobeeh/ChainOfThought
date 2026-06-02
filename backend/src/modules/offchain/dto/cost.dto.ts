import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class CostDto {

    @ApiProperty()
    cost: number;
}