import {
    BadRequestException,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { EmailService } from 'src/common/services/email.service';
import { Otp } from '../entities/otp.entity';
import { OtpService } from './otp.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn((value: string) => `hash:${value}`),
    compare: jest.fn(
        (code: string, codeHash: string) => codeHash === `hash:${code}`,
    ),
}));

function makeOtpRecord(overrides: Partial<Otp> = {}): Otp {
    return {
        id: 1,
        email: 'user@example.com',
        codeHash: 'hash:123456',
        expiresAt: new Date(Date.now() + 120_000),
        attempts: 0,
        lastSentAt: new Date(Date.now() - 30_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

function createMocks() {
    const emailService = { sendOtp: jest.fn() };
    const authService = { loginWithOtp: jest.fn() };
    const configService = { get: jest.fn(() => undefined) };

    const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn(),
    };

    const repository = {
        findOneBy: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    return {
        emailService,
        authService,
        configService,
        queryBuilder,
        repository,
    };
}

describe('OtpService', () => {
    let service: OtpService;
    let mocks: ReturnType<typeof createMocks>;

    beforeEach(async () => {
        jest.clearAllMocks();
        mocks = createMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                OtpService,
                { provide: EmailService, useValue: mocks.emailService },
                { provide: AuthService, useValue: mocks.authService },
                {
                    provide: getRepositoryToken(Otp) as string,
                    useValue: mocks.repository,
                },
                { provide: ConfigService, useValue: mocks.configService },
            ],
        }).compile();

        service = moduleRef.get(OtpService);
    });

    it('stores a bcrypt hash instead of the raw code and resets attempts', async () => {
        mocks.emailService.sendOtp.mockResolvedValue('123456');
        mocks.repository.findOneBy.mockResolvedValue(null);

        const result = await service.sendEmail({
            email: '  User@Example.COM ',
        });

        expect(result).toEqual({ message: 'OTP sent successfully' });
        expect(mocks.emailService.sendOtp).toHaveBeenCalledWith(
            'user@example.com',
        );
        expect(mocks.repository.findOneBy).toHaveBeenCalledWith({
            email: 'user@example.com',
        });

        const valuesCalls = mocks.queryBuilder.values.mock.calls as Array<
            Array<Partial<Otp>>
        >;

        const valuesArg = valuesCalls[0]?.[0];

        expect(valuesArg.email).toBe('user@example.com');
        expect(valuesArg.codeHash).toBe('hash:123456');
        expect(valuesArg.codeHash).not.toBe('123456');
        expect(valuesArg.attempts).toBe(0);
        expect(valuesArg.lastSentAt).toBeInstanceOf(Date);
        expect(valuesArg.expiresAt).toBeInstanceOf(Date);

        if (valuesArg.expiresAt instanceof Date) {
            const ttl = valuesArg.expiresAt.getTime() - Date.now();
            expect(ttl).toBeGreaterThan(110_000);
            expect(ttl).toBeLessThanOrEqual(120_000);
        }

        expect(mocks.queryBuilder.orUpdate).toHaveBeenCalledWith(
            ['codeHash', 'expiresAt', 'attempts', 'lastSentAt'],
            ['email'],
        );
    });

    it('rejects a resend within the cooldown window', async () => {
        mocks.repository.findOneBy.mockResolvedValue(
            makeOtpRecord({ lastSentAt: new Date(Date.now() - 5_000) }),
        );

        const error = await service
            .sendEmail({ email: 'user@example.com' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(HttpException);

        if (error instanceof HttpException) {
            expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }

        expect(mocks.emailService.sendOtp).not.toHaveBeenCalled();
    });

    it('allows a resend once the cooldown window has passed', async () => {
        mocks.emailService.sendOtp.mockResolvedValue('654321');
        mocks.repository.findOneBy.mockResolvedValue(
            makeOtpRecord({ lastSentAt: new Date(Date.now() - 120_000) }),
        );

        const result = await service.sendEmail({ email: 'user@example.com' });

        expect(result).toEqual({ message: 'OTP sent successfully' });
        expect(mocks.emailService.sendOtp).toHaveBeenCalledTimes(1);
    });

    it('rejects verification when no OTP exists', async () => {
        mocks.repository.findOneBy.mockResolvedValue(null);

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '123456' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.authService.loginWithOtp).not.toHaveBeenCalled();
    });

    it('rejects an expired OTP and deletes the expired record', async () => {
        mocks.repository.findOneBy.mockResolvedValue(
            makeOtpRecord({ expiresAt: new Date(Date.now() - 1_000) }),
        );

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '123456' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.repository.delete).toHaveBeenCalledWith({
            id: 1,
            codeHash: 'hash:123456',
        });
        expect(mocks.authService.loginWithOtp).not.toHaveBeenCalled();
    });

    it('rejects verification when attempts are already exhausted', async () => {
        mocks.repository.findOneBy.mockResolvedValue(
            makeOtpRecord({ attempts: 5 }),
        );

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '123456' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.repository.delete).toHaveBeenCalledWith({
            id: 1,
            codeHash: 'hash:123456',
        });
    });

    it('increments attempts on a wrong code using the read record version', async () => {
        mocks.repository.findOneBy
            .mockResolvedValueOnce(makeOtpRecord({ attempts: 2 }))
            .mockResolvedValueOnce(makeOtpRecord({ attempts: 3 }));
        mocks.queryBuilder.execute.mockResolvedValue({ affected: 1 });

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '000000' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mocks.queryBuilder.update).toHaveBeenCalledWith(Otp);
        expect(mocks.queryBuilder.set).toHaveBeenCalledWith({
            attempts: expect.any(Function) as () => string,
        });
        expect(mocks.queryBuilder.where).toHaveBeenCalledWith(
            'id = :id AND codeHash = :codeHash',
            { id: 1, codeHash: 'hash:123456' },
        );
    });

    it('rejects a mismatch when the record was replaced by a newer OTP', async () => {
        mocks.repository.findOneBy.mockResolvedValue(makeOtpRecord());
        mocks.queryBuilder.execute.mockResolvedValue({ affected: 0 });

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '000000' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.authService.loginWithOtp).not.toHaveBeenCalled();
    });

    it('normalizes the email before looking up the OTP for verification', async () => {
        mocks.repository.findOneBy.mockResolvedValue(null);

        const error = await service
            .verifyOtp({ email: '  User@Example.COM ', code: '123456' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.repository.findOneBy).toHaveBeenCalledWith({
            email: 'user@example.com',
        });
    });

    it('invalidates the OTP once attempts reach the limit', async () => {
        mocks.repository.findOneBy
            .mockResolvedValueOnce(makeOtpRecord({ attempts: 4 }))
            .mockResolvedValueOnce(makeOtpRecord({ attempts: 5 }));
        mocks.queryBuilder.execute.mockResolvedValue({ affected: 1 });

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '000000' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mocks.repository.delete).toHaveBeenCalledWith({
            id: 1,
            codeHash: 'hash:123456',
        });
    });

    it('consumes the OTP once and returns the login contract', async () => {
        mocks.repository.findOneBy.mockResolvedValue(makeOtpRecord());
        mocks.repository.delete.mockResolvedValue({ affected: 1 });
        mocks.authService.loginWithOtp.mockResolvedValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: {
                id: 1,
                email: 'user@example.com',
                name: null,
                role: 'user',
            },
        });

        const result = await service.verifyOtp({
            email: 'user@example.com',
            code: '123456',
        });

        expect(result).toEqual({
            message: 'Login successful',
            data: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: {
                    id: 1,
                    email: 'user@example.com',
                    name: null,
                    role: 'user',
                },
            },
        });
        expect(mocks.repository.delete).toHaveBeenCalledWith({
            id: 1,
            codeHash: 'hash:123456',
        });
        expect(mocks.authService.loginWithOtp).toHaveBeenCalledWith(
            'user@example.com',
        );
    });

    it('rejects verification when the record was replaced or already consumed', async () => {
        mocks.repository.findOneBy.mockResolvedValue(makeOtpRecord());
        mocks.repository.delete.mockResolvedValue({ affected: 0 });

        const error = await service
            .verifyOtp({ email: 'user@example.com', code: '123456' })
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(mocks.authService.loginWithOtp).not.toHaveBeenCalled();
    });
});
