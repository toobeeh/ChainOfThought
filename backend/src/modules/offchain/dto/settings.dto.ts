import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class SettingsDto {

    @ApiProperty()
    rewardTime: number;

    @ApiProperty()
    rewardAmount: number;

    @ApiProperty()
    renamePrice: number;

    @ApiProperty()
    accessPrice: number;
}