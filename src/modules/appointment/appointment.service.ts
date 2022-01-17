import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection } from "typeorm";
import { Person } from "../person/person.entity";
import { Appointment } from "./appointment.entity";
import { AppointmentRepository } from "./appointment.repoistory";
import { ChangeAppointmentDto } from "./dto/changeAppointment.dto";
import { StatusType } from "./status.enum";

@Injectable()
export class AppointmentService {
	constructor(
		@InjectRepository(AppointmentRepository)
		private readonly _repository: AppointmentRepository
	) {}

	async get(id: number) {
		const appointment: Appointment = await this._repository.findOne(id);
		return appointment;
	}

	async getAllByUserId(id: number) {
		const personRepo = await getConnection().getRepository(Person);
		const existPerson = await personRepo.findOne(id);

		if (!existPerson) return null

		const appointments: Appointment[] = await this._repository.find({
			where: { owner: existPerson.id },
		});

		return appointments;
	}

	async getAppointmensRequest() {
		const appointments: Appointment[] = await this._repository.find({
			where: { status: StatusType.WAITING },
		});

		return appointments;
	}

	async getAppointmensAccepted() {
		const appointments: Appointment[] = await this._repository.find({
			where: { status: StatusType.ACCEPTED },
		});

		return appointments;
	}

	async getAppointmensUnconfirmed(): Promise<Appointment[]> {
		const appointments: Appointment[] = await this._repository.find({
			where: { status: StatusType.MODIFY },
		});

		return appointments;
	}

	async create(appointment: Appointment) {
		const personRepo = await getConnection().getRepository(Person);
		const existPerson = await personRepo.findOne({
			where: { id: appointment.owner },
		});

		if (!existPerson) return null

		appointment.owner = existPerson;

		const savedAppointment: Appointment = await this._repository.save(
			appointment
		);
		return savedAppointment;
	}

	async adminAcceptAppointment(id: number) {
		const property = await this._repository.findOne({
			where: { id },
		});

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.ACCEPTED;
		updateObj.daySelected = updateObj.dayPreferred;
		updateObj.hourSelected = updateObj.hourPreferred;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null
	}

	async clientAcceptAppointment(id: number, userId: number) {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property.owner.id != userId) return null

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.ACCEPTED;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null
	}

	async adminChangeAppointment(
		id: number,
		change: ChangeAppointmentDto
	) {
		const property = await this._repository.findOne({
			where: { id },
		});

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.MODIFY;
		updateObj.daySelected = change.day;
		updateObj.hourSelected = change.hour;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null
	}

	async adminCancelAppointment(
		id: number
	) {
		const property = await this._repository.findOne({
			where: { id },
		});

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.CANCELED;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null
	}

	async clientChangeAppointment(
		id: number,
		change: ChangeAppointmentDto,
		userId: number
	) {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property.owner.id != userId) return null

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.WAITING;
		updateObj.dayPreferred = change.day;
		updateObj.hourPreferred = change.hour;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else return null
	}

	async update(id: number, appointment: Appointment) {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...appointment, // updated fields
			});
		} else return null
	}

	async delete(id: number, isAdmin: boolean, userId: number) {
		const appointmentExist = await this._repository.findOne(id ,{
			relations: ["owner"]
		});

		if (!appointmentExist) return null

		if (!isAdmin && userId != appointmentExist.owner.id)
			throw new UnauthorizedException();

		await this._repository.delete(id);
	}
}
