import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "src/shared/shared.module";
import { AuthModule } from "../auth/auth.module";
import { RoleRepository } from "../role/role.repository";
import { PersonController } from "./person.controller";
import { Person } from "./person.entity";
import { PersonRepository } from "./person.repository";
import { PersonService } from "./person.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Person, PersonRepository, RoleRepository]),
		SharedModule,
		AuthModule,
	],
	providers: [PersonService],
	controllers: [PersonController],
})
export class PersonModule {}
