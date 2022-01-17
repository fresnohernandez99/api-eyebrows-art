import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { AuthService } from "./auth.service";
import { SigninDto, SignupDto } from "./dto";
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export const storage = {
    storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}

@Controller("auth")
export class AuthController {
	constructor(private readonly _authService: AuthService) {}

	@Post("/signup")
	@UseInterceptors(FileInterceptor(
		'profile', storage
	))
	@UsePipes(ValidationPipe)
	async signup(@UploadedFile() file: Express.Multer.File, @Body() signupDto: SignupDto) {
		if (file) {
			signupDto.photo = file.filename;
		}
		var registering = this._authService.signup(signupDto);

		if (registering == null)
			return {
				code: 23,
				message: "",
				data: {},
			};

		return {
			code: 1,
			message: "",
			data: { registering },
		};
	}

	@Post("/signin")
	@UsePipes(ValidationPipe)
	async signin(@Body() signinDto: SigninDto) {
		return this._authService.signin(signinDto);
	}
}
