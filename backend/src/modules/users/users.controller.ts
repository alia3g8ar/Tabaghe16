import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/common/decorators/role.decorator';
import { roleEnum } from 'src/common/enums/role.enum';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserVerificationDto } from './dto/update-user-verification.dto';
import { UsersService } from './users.service';

type AdminRequest = Request & {
    user: {
        sub: number;
        role: roleEnum | string;
    };
};

@Controller('admin/users')
@Role([roleEnum.ADMIN, roleEnum.OWNER])
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@Query() query: ListUsersQueryDto) {
        return this.usersService.findAll(query);
    }

    @Patch(':id/role')
    updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserRoleDto,
        @Req() request: AdminRequest,
    ) {
        return this.usersService.updateRole(id, dto, request.user);
    }

    @Patch(':id/verification')
    updateVerification(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserVerificationDto,
        @Req() request: AdminRequest,
    ) {
        return this.usersService.updateVerification(id, dto, request.user);
    }

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: AdminRequest,
    ) {
        return this.usersService.remove(id, request.user);
    }
}
