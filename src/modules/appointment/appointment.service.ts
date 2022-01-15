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

	async get(id: number): Promise<Appointment> {
		if (!id) {
			throw new BadRequestException("id must be sent");
		}

		const appointment: Appointment = await this._repository.findOne(id);

		if (!appointment) throw new NotFoundException();

		return appointment;
	}

	async getAllByUserId(id: number): Promise<Appointment[]> {
		const personRepo = await getConnection().getRepository(Person);
		const existPerson = await personRepo.findOne(id);

		if (!existPerson) throw new BadRequestException();

		const appointments: Appointment[] = await this._repository.find({
			where: { owner: existPerson.id },
		});

		if (appointments.length == 0) throw new NotFoundException();

		return appointments;
	}

	async getAppointmensRequest(): Promise<Appointment[]> {
		const appointments: Appointment[] = await this._repository.find({
			where: { status: StatusType.WAITING },
		});

		return appointments;
	}

	async getAppointmensAccepted(): Promise<Appointment[]> {
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

	async create(appointment: Appointment): Promise<Appointment> {
		const personRepo = await getConnection().getRepository(Person);
		const existPerson = await personRepo.findOne({
			where: { id: appointment.owner },
		});

		if (!existPerson) throw new BadRequestException();

		appointment.owner = existPerson;

		const savedAppointment: Appointment = await this._repository.save(
			appointment
		);
		return savedAppointment;
	}

	async adminAcceptAppointment(id: number): Promise<Object> {
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
		} else throw new BadRequestException();
	}

	async clientAcceptAppointment(id: number, userId: number): Promise<Object> {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property.owner.id != userId) throw new UnauthorizedException();

		var updateString = JSON.stringify(property);
		var updateObj: Appointment = JSON.parse(updateString);
		updateObj.status = StatusType.ACCEPTED;

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...updateObj, // updated fields
			});
		} else throw new BadRequestException();
	}

	async adminChangeAppointment(
		id: number,
		change: ChangeAppointmentDto
	): Promise<Object> {
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
		} else throw new BadRequestException();
	}

	async clientChangeAppointment(
		id: number,
		change: ChangeAppointmentDto,
		userId: number
	): Promise<Object> {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property.owner.id != userId) throw new UnauthorizedException();

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
		} else throw new BadRequestException();
	}

	async update(id: number, appointment: Appointment): Promise<Object> {
		const property = await this._repository.findOne({
			where: { id },
		});

		if (property) {
			return await this._repository.save({
				...property, // existing fields
				...appointment, // updated fields
			});
		} else throw new BadRequestException();
	}

	async delete(id: number, isAdmin: boolean, userId: number): Promise<void> {
		const appointmentExist = await this._repository.findOne(id ,{
			relations: ["owner"]
		});

		if (!appointmentExist) throw new NotFoundException();

		if (!isAdmin && userId != appointmentExist.owner.id)
			throw new UnauthorizedException();

		await this._repository.delete(id);
	}
}
