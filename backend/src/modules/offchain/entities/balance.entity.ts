import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class BalanceEntity {

    @PrimaryColumn()
    id: string;

    @Column()
    balance: number;
}