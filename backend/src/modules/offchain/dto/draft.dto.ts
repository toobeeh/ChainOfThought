import {Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class DraftDto {

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty({required: false})
    icon?: string;

    @ApiProperty({required: false})
    psHash?: string;
}