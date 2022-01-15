import { IsDate, IsInt, IsNotEmpty } from "class-validator";
import { Role } from "src/modules/role/role.entity";

export class ChangeAppointmentDto {
	@IsDate()
	day: Date;

	@IsInt()
	hour: number;
}
