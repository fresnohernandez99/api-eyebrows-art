import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Res,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("images")
export class ImagesController {
	
    @UseGuards(AuthGuard())
	@Get(":pathname")
	async get(@Param("pathname") pathname: string, @Res() res) {
		res.sendFile(pathname, { root: "./public/images" });
	}
}
