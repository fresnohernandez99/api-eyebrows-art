import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "../role/decorators/role.decorator";
import { RoleGuard } from "../role/guards/role.guard";
import { RoleType } from "../role/roletype.enum";
import { GetPersonDto } from "./dto/getPerson.dto";
import { Person } from "./person.entity";
import { PersonService } from "./person.service";
import { storage } from "../auth/auth.controller";

@Controller("person")
export class PersonController {
	constructor(private readonly _personService: PersonService) {}

	@UseGuards(AuthGuard())
	@Get()
	async getPeople() {
		const people = await this._personService.getAll();

		if (people.length == 0)
			return {
				code: 2,
				message: "",
				data: {},
			};

		let formatedPeople = people.map((item) => new GetPersonDto(item));
		return {
			code: 1,
			message: "",
			data: { formatedPeople },
		};
	}

	@Get(":id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async getUser(
		@Param("id", ParseIntPipe)
		id: number
	) {
		const user = await this._personService.get(id);

		if (!user)
			return {
				code: 2,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { user },
		};
	}

	@Get("/requests/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async getRequests() {
		const requests = await this._personService.getRequests();

		if (requests.length == 0)
			return {
				code: 2,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { requests },
		};
	}

	@Patch(":id")
	@UseInterceptors(FileInterceptor("profile", storage))
	@UseGuards(AuthGuard(), RoleGuard)
	async updatePerson(
		@UploadedFile() file: Express.Multer.File,
		@Request() req,
		@Param("id", ParseIntPipe) id: number,
		@Body() person: Person
	) {
		if (req.user.id != id)
			return {
				code: 24,
				message: "unauthorized",
				data: {},
			};

		if (file) person.photo = file.filename;

		var update = await this._personService.update(id, person);

		if (update == null)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { update },
		};
	}

	@Patch("/accept-request/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async acceptRequest(@Param("id", ParseIntPipe) id: number) {
		var accept = await this._personService.acceptRequest(id);

		if (accept == null)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { accept },
		};
	}

	@Delete(":id")
	@UseGuards(AuthGuard(), RoleGuard)
	async deletePerson(
		@Request() req,
		@Param("id", ParseIntPipe)
		id: number
	) {
		if (req.user.roles[0] != RoleType.ADMIN && req.user.id != id)
			return {
				code: 24,
				message: "",
				data: {},
			};

		var deleting = await this._personService.delete(id);
		
		if (deleting == null)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { deleting },
		};
	}

	@Post("setRole/:personId/:roleId")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async setRoleToPerson(
		@Param("personId", ParseIntPipe) personId: number,
		@Param("personId", ParseIntPipe) roleId: number
	) {
		var setting = this._personService.setRoleToPerson(personId, roleId);

		if (setting == null)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { setting },
		};
	}
}
