import {
	Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection } from "typeorm";
import { Role } from "../role/role.entity";
import { RoleRepository } from "../role/role.repository";
import { RoleType } from "../role/roletype.enum";
import { Person } from "./person.entity";
import { PersonRepository } from "./person.repository";
import { StateType } from "./state.enum";

@Injectable()
export class PersonService {
	constructor(
		@InjectRepository(PersonRepository)
		private readonly _personRepository: PersonRepository,
		@InjectRepository(RoleRepository)
		private readonly _roleRepository: RoleRepository
	) {}

	async get(id: number) {
		const person: Person = await this._personRepository.findOne(id);
		return person;
	}

	async getAll() {
		const people: Person[] = await this._personRepository.find();
		return people;
	}

	async getRequests() {
		const people: Person[] = await this._personRepository.find({
			where: { state: StateType.WAITING },
		});

		return people;
	}

	async create(person: Person) {
		const repo = await getConnection().getRepository(Role);
		const defaultRole = await repo.findOne({
			where: { name: RoleType.GENERAL },
		});
		person.roles = [defaultRole];

		const savedPerson: Person = await this._personRepository.save(person);
		return savedPerson;
	}

	async update(id: number, person: Person) {
		const property = await this._personRepository.findOne({
			where: { id },
		});

		if (property) {
			return await this._personRepository.save({
				...property, // existing fields
				...person, // updated fields
			});
		} else return null;
	}

	async acceptRequest(id: number) {
		const property = await this._personRepository.findOne({
			where: { id },
		});

		var updateString = JSON.stringify(property);
		var updateObj = JSON.parse(updateString);
		updateObj.state = StateType.ACTIVE;

		if (property) {
			return await this._personRepository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null;
	}

	async delete(id: number) {
		const personExist = await this._personRepository.findOne(id);

		if (!personExist) return null;

		await this._personRepository.delete(id);
	}

	async setRoleToPerson(personId: number, roleId: number) {
		const personExist = await this._personRepository.findOne(personId);

		if (!personExist) return null;

		const roleExist = await this._roleRepository.findOne(roleId);

		if (!roleExist) return null;

		personExist.roles.push(roleExist);
		return await this._personRepository.save(personExist);
	}
}
