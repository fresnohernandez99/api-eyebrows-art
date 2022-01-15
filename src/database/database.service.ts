import { TypeOrmModule } from "@nestjs/typeorm";
import { Configuration } from "src/config/config.keys";
import { ConfigModule } from "src/config/config.module";
import { ConfigService } from "src/config/config.service";
import { ConnectionOptions } from "typeorm";

export const databaseProviders = [
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		async useFactory(config: ConfigService) {
			return {
				type: "postgres" as "postgres",
				host: config.get(Configuration.HOST),
				username: config.get(Configuration.USERNAME),
				port: Number.parseInt(config.get(Configuration.DATABASE_PORT)),
				database: config.get(Configuration.DATABASE),
				password: config.get(Configuration.PASSWORD),
				entities: ["dist/**/*.entity.js"],
				migrations: ["src/database/migrations"],
				synchronize: true,
				url: config.get(Configuration.DATABASE_URL),
				ssl: true,
				extra: {
					ssl: {
						rejectUnauthorized: false,
					},
				},
			} as ConnectionOptions;
		},
	}),
];
