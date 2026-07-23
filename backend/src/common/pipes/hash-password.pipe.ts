import { Injectable, PipeTransform } from '@nestjs/common';
import { hashSync, genSalt } from 'bcrypt';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
    async transform(value: any) {
        value.password = hashSync(value.password, await genSalt());

        return value;
    }
}
