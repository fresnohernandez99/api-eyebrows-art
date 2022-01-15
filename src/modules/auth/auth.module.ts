import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { AuthRepository } from "./auth.repository";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "src/config/config.module";
import { ConfigService } from "src/config/config.service";
import { Configuration } from "src/config/config.keys";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		TypeOrmModule.forFeature([AuthRepository]),
		PassportModule.register({
			defaultStrategy: "jwt",
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory(config: ConfigService) {
				return {
					secret: config.get(Configuration.JWT_SECRET),
					signOptions: {
						expiresIn: 100000,
					},
				};
			},
		})
	],
	controllers: [AuthController],
	providers: [AuthService, ConfigService, JwtStrategy],
	exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
