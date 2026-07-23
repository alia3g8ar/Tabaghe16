export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  email: string;
}

export interface OtpFormValues {
  otp: string;
}

export interface LoginResponse {
  token: string;
  role?: string;
  message?: string;
}

export interface SignupResponse {
  message: string;
  success: boolean;
  otpCode?: string;
}

export interface OtpResponse {
  message: string;
  success: boolean;
  token?: string;
  role?: string;
}
