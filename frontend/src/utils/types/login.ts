export interface EmailFormValues {
  email: string;
  name: string;
}

export interface OtpFormValues {
  code: string;
}

export interface SendOtpResponse {
  message: string;
  success?: boolean;
}

export interface CheckNameResponse {
  needsName: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface VerifyOtpResponse {
  message: string;
  success?: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}
