import { IsNotEmpty } from "class-validator";
import { Role } from "src/modules/role/role.entity";

export class PersonDto {
	@IsNotEmpty()
	id: number;

	@IsNotEmpty()
	phone: string;

	@IsNotEmpty()
	roles: Role[];
}
