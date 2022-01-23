import { Repository, EntityRepository, getConnection } from "typeorm";
import { SignupDto } from "./dto";
import { genSalt, hash } from "bcryptjs";
import { Person } from "../person/person.entity";
import { RoleRepository } from "../role/role.repository";
import { Role } from "../role/role.entity";
import { RoleType } from "../role/roletype.enum";

@EntityRepository(Person)
export class AuthRepository extends Repository<Person> {
	async signup(signupDto: SignupDto) {
		const { phone, password, displayname, photo } = signupDto;
		const person = new Person();
		person.phone = phone;
		person.displayname = displayname;

		if (photo) person.photo = photo;
		else person.photo = "default.png";

		const roleRepository: RoleRepository = await getConnection().getRepository(
			Role
		);

		const defaultRole: Role = await roleRepository.findOne({
			where: { name: RoleType.GENERAL },
		});

		person.roles = [defaultRole];

		const salt = await genSalt(10);
		person.password = await hash(password, salt);

		return await person.save();
	}
}
