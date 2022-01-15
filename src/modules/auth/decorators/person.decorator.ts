import { createParamDecorator } from "@nestjs/common";
import { PersonDto } from "src/modules/person/dto/person.dto";

export const GetUser = createParamDecorator(
	(data, req): PersonDto => {
		return req.user;
	}
);
