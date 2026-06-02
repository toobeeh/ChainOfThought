import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class UserDto {

    @ApiProperty()
    rewardAvailable: boolean;

    @ApiProperty()
    balance: number;

    @ApiProperty({required: false})
    alias?: string;
}