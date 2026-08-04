import { IsIn } from 'class-validator';
import { roleEnum } from 'src/common/enums/role.enum';

const manageableRoles = [roleEnum.USER, roleEnum.ADMIN, roleEnum.OWNER];

export class UpdateUserRoleDto {
    @IsIn(manageableRoles) role: roleEnum;
}
