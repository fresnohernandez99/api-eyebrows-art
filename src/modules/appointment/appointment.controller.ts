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
	async get(@Param("id", ParseIntPipe) id: number): Promise<Appointment> {
		const appointment = await this._service.get(id);
		return appointment;
	}

	@Get("/client/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	async getAllByUserId(
		@Request() req,
		@Param("id", ParseIntPipe) id: number
	): Promise<Appointment[]> {
		if (req.user.id != id) throw new UnauthorizedException();

		const appointments = await this._service.getAllByUserId(id);
		return appointments;
	}

	@Get("/request/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async getAppointmensRequest(): Promise<Appointment[]> {
		const appointments = await this._service.getAppointmensRequest();
		return appointments;
	}

	@Get("/accepted/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async getAppointmensAccepted(): Promise<Appointment[]> {
		const appointments = await this._service.getAppointmensAccepted();
		return appointments;
	}

	@Get("/unconfirmed/all")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async getAppointmensUnconfirmed(): Promise<Appointment[]> {
		const appointments = await this._service.getAppointmensUnconfirmed();
		return appointments;
	}

	@Post()
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async createAppointment(@Request() req, @Body() appointment: Appointment) {
		if (req.user.id != appointment.owner) throw new UnauthorizedException();
		return await this._service.create(appointment);
	}

	@Patch("/admin/accept/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async adminAcceptAppointment(@Param("id", ParseIntPipe) id: number) {
		return await this._service.adminAcceptAppointment(id);
	}

	@Patch("/admin/change/:id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async adminChangeAppointment(
		@Param("id", ParseIntPipe) id: number,
		@Body() change: ChangeAppointmentDto
	) {
		return await this._service.adminChangeAppointment(id, change);
	}

	@Patch("/client/accept/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async clientAcceptAppointment(
		@Request() req,
		@Param("id", ParseIntPipe) id: number
	) {
		return await this._service.clientAcceptAppointment(id, req.user.id);
	}

	@Patch("/admin/change/:id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async clientChangeAppointment(
		@Param("id", ParseIntPipe) id: number,
		@Request() req,
		@Body() change: ChangeAppointmentDto
	) {
		return await this._service.clientChangeAppointment(id, change, req.user.id);
	}

	@Delete(":id")
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async deleteAppointment(
		@Request() req,
		@Param("id", ParseIntPipe) id: number
	) {
		const isAdmin = req.user.roles[0] == RoleType.ADMIN;

		await this._service.delete(id, isAdmin, req.user.id);
		return {
			statusCode: 204,
			message: "You have deleted an obj.",
		};
	}
}
