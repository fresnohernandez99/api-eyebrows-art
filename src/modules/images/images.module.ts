import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ImagesController } from "./images.controller";

@Module({
	imports: [AuthModule],
	controllers: [ImagesController],
})
export class ImagesModule {}
