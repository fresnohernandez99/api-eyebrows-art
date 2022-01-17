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
	UnauthorizedException,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../role/decorators/role.decorator";
import { RoleGuard } from "../role/guards/role.guard";
import { RoleType } from "../role/roletype.enum";
import { Appointment } from "./appointment.entity";
import { AppointmentService } from "./appointment.service";
import { ChangeAppointmentDto } from "./dto/changeAppointment.dto";

@Controller("appointment")
export class AppointmentController {
	constructor(private readonly _service: AppointmentService) {}

	@Get(":id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async get(@Param("id", ParseIntPipe) id: number) {
		const appointment = await this._service.get(id);

		if (appointment == null)
			return {
				code: 2,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { appointment },
		};
	}

	@Get("/client/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async getAllByUserId(@Request() req, @Param("id", ParseIntPipe) id: number) {
		if (req.user.id != id)
			return {
				code: 24,
				message: "",
				data: {},
			};

		const appointments = await this._service.getAllByUserId(id);

		if (!appointments)
			return {
				code: 25,
				message: "",
				data: { appointments },
			};

		if (appointments.length == 0)
			return {
				code: 2,
				message: "",
				data: { appointments },
			};

		return {
			code: 1,
			message: "",
			data: { appointments },
		};
	}

	@Get("/request/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async getAppointmensRequest() {
		const appointments = await this._service.getAppointmensRequest();
		if (appointments.length == 0)
			return {
				code: 2,
				message: "",
				data: { appointments },
			};

		return {
			code: 1,
			message: "",
			data: { appointments },
		};
	}

	@Get("/accepted/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async getAppointmensAccepted() {
		const appointments = await this._service.getAppointmensAccepted();

		if (appointments.length == 0)
			return {
				code: 2,
				message: "",
				data: { appointments },
			};

		return {
			code: 1,
			message: "",
			data: { appointments },
		};
	}

	@Get("/unconfirmed/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async getAppointmensUnconfirmed() {
		const appointments = await this._service.getAppointmensUnconfirmed();
		if (appointments.length == 0)
			return {
				code: 2,
				message: "",
				data: { appointments },
			};

		return {
			code: 1,
			message: "",
			data: { appointments },
		};
	}

	@Post()
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async createAppointment(@Request() req, @Body() appointment: Appointment) {
		if (req.user.id != appointment.owner)
			return {
				code: 24,
				message: "",
				data: {},
			};
		var creating = await this._service.create(appointment);
		if (!creating)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { creating },
		};
	}

	@Patch("/admin/accept/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async adminAcceptAppointment(@Param("id", ParseIntPipe) id: number) {
		var accepting = await this._service.adminAcceptAppointment(id);

		if (!accepting)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { accepting },
		};
	}

	@Patch("/admin/change/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async adminChangeAppointment(
		@Param("id", ParseIntPipe) id: number,
		@Body() change: ChangeAppointmentDto
	) {
		var changing = await this._service.adminChangeAppointment(id, change);

		if (!changing)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { changing },
		};
	}

	@Patch("/admin/cancel/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async adminCancelAppointment(
		@Param("id", ParseIntPipe) id: number
	) {
		var canceling = await this._service.adminCancelAppointment(id);

		if (!canceling)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { canceling },
		};
	}

	@Patch("/client/accept/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async clientAcceptAppointment(
		@Request() req,
		@Param("id", ParseIntPipe) id: number
	) {
		var accepting = await this._service.clientAcceptAppointment(id, req.user.id);

		if (!accepting)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { accepting },
		};
	}

	@Patch("/client/change/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async clientChangeAppointment(
		@Param("id", ParseIntPipe) id: number,
		@Request() req,
		@Body() change: ChangeAppointmentDto
	) {
		var changing = await this._service.clientChangeAppointment(id, change, req.user.id);
		
		if (!changing)
			return {
				code: 25,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { changing },
		};
	}

	@Delete(":id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async deleteAppointment(
		@Request() req,
		@Param("id", ParseIntPipe) id: number
	) {
		const isAdmin = req.user.roles[0] == RoleType.ADMIN;

		var deleting = await this._service.delete(id, isAdmin, req.user.id);
		
		if (!deleting)
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
}
