import { roleEnum } from 'src/common/enums/role.enum';

export interface DemoUser {
    name: string;
    email: string;
    role: roleEnum;
    is_verified: boolean;
}

export const demoUsers: DemoUser[] = [
    {
        name: 'سارا محمدی',
        email: 'sara.demo@tabaghe16.com',
        role: roleEnum.USER,
        is_verified: true,
    },
    {
        name: 'علی رضایی',
        email: 'ali.demo@tabaghe16.com',
        role: roleEnum.USER,
        is_verified: true,
    },
    {
        name: 'نگین کریمی',
        email: 'negin.demo@tabaghe16.com',
        role: roleEnum.USER,
        is_verified: false,
    },
    {
        name: 'امیر حسینی',
        email: 'amir.demo@tabaghe16.com',
        role: roleEnum.USER,
        is_verified: true,
    },
];
