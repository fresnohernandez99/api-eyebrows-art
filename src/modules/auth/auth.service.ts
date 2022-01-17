import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Person } from "../person/person.entity";
import { AuthRepository } from "./auth.repository";
import { SigninDto, SignupDto } from "./dto";
import { compare } from "bcryptjs";
import { IJwtPayload } from "./jwt-payload.interface";
import { RoleType } from "../role/roletype.enum";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(AuthRepository)
		private readonly _authRepository: AuthRepository,
		private readonly _jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		const { phone } = signupDto;
		const personExists = await this._authRepository.findOne({
			where: [{ phone }],
		});

		if (personExists) return null;

		return this._authRepository.signup(signupDto);
	}

	async signin(signinDto: SigninDto) {
		const { phone, password } = signinDto;

		const person: Person = await this._authRepository.findOne({
			where: { phone },
		});

		if (!person) return {
			code: 26,
			message: "not a user",
			data: {},
		};

		const isMatch = await compare(password, person.password);

		if (!isMatch) return {
			code: 27,
			message: "wrong password",
			data: {},
		};

		const payload: IJwtPayload = {
			id: person.id,
			phone: person.phone,
			roles: person.roles.map((r) => r.name as RoleType),
		};

		console.log("Login: " + JSON.stringify(payload));

		const token = await this._jwtService.sign(payload);

		var isAdmin = false;

		person.roles.find((rol) => {
			if (rol.name == RoleType.ADMIN) isAdmin = true;
		});

		return {
			code: 1,
			message: "login success",
			data: {
				token,
				phone: person.phone,
				displayname: person.displayname,
				isAdmin,
			},
		};
	}
}
