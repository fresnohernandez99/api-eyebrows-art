import {
	BadRequestException,
	Injectable,
	NotFoundException,
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

	async get(id: number): Promise<Person> {
		if (!id) {
			throw new BadRequestException("id must be sent");
		}

		const person: Person = await this._personRepository.findOne(id);

		if (!person) {
			throw new NotFoundException();
		}

		return person;
	}

	async getAll(): Promise<Person[]> {
		const people: Person[] = await this._personRepository.find();

		return people;
	}

	async getRequests(): Promise<Person[]> {
		const people: Person[] = await this._personRepository.find({
			where: { state: StateType.WAITING },
		});

		return people;
	}

	async create(person: Person): Promise<Person> {
		const repo = await getConnection().getRepository(Role);
		const defaultRole = await repo.findOne({
			where: { name: RoleType.GENERAL },
		});
		person.roles = [defaultRole];

		const savedPerson: Person = await this._personRepository.save(person);
		return savedPerson;
	}

	async update(id: number, person: Person): Promise<Object> {
		const property = await this._personRepository.findOne({
			where: { id },
		});

		if (property) {
			return await this._personRepository.save({
				...property, // existing fields
				...person, // updated fields
			});
		} else throw new BadRequestException();
	}

	async acceptRequest(id: number): Promise<Object> {
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
		} else throw new BadRequestException();
	}

	async delete(id: number): Promise<void> {
		const personExist = await this._personRepository.findOne(id);

		if (!personExist) {
			throw new NotFoundException();
		}

		await this._personRepository.delete(id);
	}

	async setRoleToPerson(personId: number, roleId: number) {
		const personExist = await this._personRepository.findOne(personId);

		if (!personExist) {
			throw new NotFoundException();
		}

		const roleExist = await this._roleRepository.findOne(roleId);

		if (!roleExist) {
			throw new NotFoundException("Role does not exist");
		}

		personExist.roles.push(roleExist);
		await this._personRepository.save(personExist);

		return {
			statusCode: 200,
			message: "Role added.",
		};
	}
}
