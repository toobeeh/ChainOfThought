import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class RewardEntity {

    @PrimaryColumn()
    author: string;

    @Column()
    timestamp: string;
}