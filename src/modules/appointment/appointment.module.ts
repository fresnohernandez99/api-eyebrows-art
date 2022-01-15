import { Module } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentRepository } from "./appointment.repoistory";

@Module({
	imports: [TypeOrmModule.forFeature([AppointmentRepository]), AuthModule],
	providers: [AppointmentService],
	controllers: [AppointmentController],
})
export class AppointmentModule {}
