import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Person } from "../person/person.entity";

@Entity()
export class Role extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({ type: "varchar", length: 20, nullable: false })
	name: string;

	@Column({ type: "text", nullable: false })
	description: string;

	@ManyToMany((type) => Person, (user) => user.roles)
	@JoinColumn()
	people: Person[];

	@CreateDateColumn({ type: "timestamp", name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp", name: "updated_at" })
	updatedAt: Date;
}
