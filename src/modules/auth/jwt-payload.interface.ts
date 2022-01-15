import { RoleType } from "../role/roletype.enum";

export interface IJwtPayload {
	id: number;
	phone: string;
	roles: RoleType[];
	iat?: Date;
}
