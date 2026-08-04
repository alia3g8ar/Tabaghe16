import { Injectable, PipeTransform } from '@nestjs/common';
import { genSalt, hashSync } from 'bcrypt';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
    async transform(value: CreateUserDto): Promise<CreateUserDto> {
        value.password = hashSync(value.password, await genSalt());

        return value;
    }
}
