import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

function isAbsoluteHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);

        return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            Boolean(url.hostname)
        );
    } catch {
        return false;
    }
}

export function IsHttpUrl(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isHttpUrl',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    return (
                        typeof value === 'string' && isAbsoluteHttpUrl(value)
                    );
                },
                defaultMessage(arguments_: ValidationArguments) {
                    return `${arguments_.property} must be an absolute HTTP or HTTPS URL`;
                },
            },
        });
    };
}

export function IsHttpUrlOrRootRelative(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isHttpUrlOrRootRelative',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const isRootRelative =
                        value.startsWith('/') &&
                        !value.startsWith('//') &&
                        !/\s/.test(value);

                    return isRootRelative || isAbsoluteHttpUrl(value);
                },
                defaultMessage(arguments_: ValidationArguments) {
                    return `${arguments_.property} must be an absolute HTTP/HTTPS URL or a root-relative path`;
                },
            },
        });
    };
}
