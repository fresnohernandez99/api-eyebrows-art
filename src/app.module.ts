import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { ConfigService } from "./config/config.service";
import { Configuration } from "./config/config.keys";
import { PersonModule } from "./modules/person/person.module";
import { ImagesModule } from './modules/images/images.module';
import { AppointmentModule } from "./modules/appointment/appointment.module";

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [
		ConfigModule,
		DatabaseModule,
		PersonModule,
		RoleModule,
		AuthModule,
		ImagesModule,
		AppointmentModule,
	],
})
export class AppModule {
	static port: number | string;

	constructor(private readonly _configService: ConfigService) {
		AppModule.port = this._configService.get(Configuration.PORT);
	}
}
