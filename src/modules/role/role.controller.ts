import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
	ParseIntPipe,
	UseGuards,
	ValidationPipe,
	UsePipes,
} from "@nestjs/common";
import { RoleService } from "./role.service";
import { Role } from "./role.entity";
import { Roles } from "./decorators/role.decorator";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "./guards/role.guard";
import { RoleType } from "./roletype.enum";

@Controller("roles")
export class RoleController {
	constructor(private readonly _roleService: RoleService) {}

	@Get(":id")
	async getRole(@Param("id", ParseIntPipe) id: number): Promise<Role> {
		const role = await this._roleService.get(id);
		return role;
	}

	@Get()
	async getRoles(): Promise<Role[]> {
		const roles = await this._roleService.getAll();
		return roles;
	}

	@Post()
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async createRole(@Body() role: Role): Promise<Role> {
		const createdRole = await this._roleService.create(role);
		return createdRole;
	}

	@Patch(":id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	@UsePipes(ValidationPipe)
	async updateRole(@Param("id", ParseIntPipe) id: number, @Body() role: Role) {
		await this._roleService.update(id, role);
		return {
			"statusCode": 204,
			"message": "You have updated a role."
		};
	}

	@Delete(":id")
	@Roles(RoleType.ADMIN)
	@UseGuards(AuthGuard(), RoleGuard)
	async deleteRole(@Param("id", ParseIntPipe) id: number) {
		await this._roleService.delete(id);
		return {
			"statusCode": 204,
			"message": "You have deleted a role."
		};
	}
}
