import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from "typeorm";
import { Person } from "../person/person.entity";
import { StatusType } from "./status.enum";

@Entity()
export class Appointment extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column()
	hourPreferred: number;

	@Column({ type: "timestamp", name: "day_preferred" })
	dayPreferred: Date;

	@Column({ nullable: true })
	hourSelected: number;

	@Column({ type: "timestamp", name: "day_selected", nullable: true })
	daySelected: Date;

	@Column({ type: "varchar", nullable: true })
	description: string;

	@ManyToOne(() => Person, person => person.appointments)
    owner: Person;

	@Column({ type: "varchar", nullable: true, default: StatusType.WAITING })
	status: string;

	@CreateDateColumn({ type: "timestamp", name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp", name: "updated_at" })
	updatedAt: Date;
}
