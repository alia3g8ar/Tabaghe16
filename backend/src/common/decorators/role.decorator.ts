import { SetMetadata } from '@nestjs/common';
import { roleEnum } from '../enums/role.enum';

export const ROLE_KEY = 'roles';

export const Role = (roles: roleEnum[]) => SetMetadata(ROLE_KEY, roles);
