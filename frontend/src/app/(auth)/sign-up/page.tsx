"use client";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoginFormValues,
  LoginResponse,
  OtpFormValues,
  OtpResponse,
  SignupFormValues,
  SignupResponse,
} from "@/utils/types/login";

function SignIn() {
  const router = useRouter();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const loginInitialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const signupInitialValues: SignupFormValues = {
    email: "",
  };

  const otpInitialValues: OtpFormValues = {
    otp: "",
  };

  const loginValidationSchema = Yup.object({
    email: Yup.string().email("ایمیل معتبر نیست").required("ایمیل اجباری است"),
    password: Yup.string()
      .min(6, "حداقل ۶ کاراکتر")
      .required("رمز عبور اجباری است"),
  });

  const signupValidationSchema = Yup.object({
    email: Yup.string().email("ایمیل معتبر نیست").required("ایمیل اجباری است"),
  });

  const otpValidationSchema = Yup.object({
    otp: Yup.string()
      .length(6, "کد باید 6 رقم باشد")
      .matches(/^\d+$/, "فقط عدد مجاز است")
      .required("کد تایید اجباری است"),
  });

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>,
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ورود ناموفق بود");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || "user");
      router.push(data.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "خطای ناشناختهای رخ داد",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (
    values: SignupFormValues,
    { setSubmitting, setStatus }: FormikHelpers<SignupFormValues>,
  ) => {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("سرور پاسخ غیرمنتظره ارسال کرد");
      }

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ثبتنام ناموفق بود");
      }

      setUserEmail(values.email);
      setOtpCode(data.otpCode || ""); // فقط برای تست
      setIsOtpMode(true);
      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "خطای ناشناختهای رخ داد",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerify = async (
    values: OtpFormValues,
    { setSubmitting, setStatus }: FormikHelpers<OtpFormValues>,
  ) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: values.otp }),
      });

      const data: OtpResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "تایید کد ناموفق بود");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role || "user");
        router.push("/");
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "خطای ناشناختهای رخ داد",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetToLogin = () => {
    setIsSignupMode(false);
    setIsOtpMode(false);
    setUserEmail("");
    setOtpCode("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-4">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#161616] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isOtpMode
              ? "تایید کد"
              : isSignupMode
                ? "ثبتنام در طبقه ۱۶"
                : "ورود به طبقه ۱۶"}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {isOtpMode
              ? `کد 6 رقمی ارسال شده به ${userEmail} را وارد کنید`
              : isSignupMode
                ? "برای دریافت کد تایید، ایمیل خود را وارد کنید"
                : "جایی برای تمرکز، رشد و ساختن"}
          </p>
        </div>

        {/* حالت تایید کد */}
        {isOtpMode ? (
          <Formik<OtpFormValues>
            initialValues={otpInitialValues}
            validationSchema={otpValidationSchema}
            onSubmit={handleOtpVerify}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6 text-end">
                {/* نمایش کد برای تست */}
                {otpCode && (
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800 text-center">
                    <p className="text-sm text-blue-400">
                      کد تست:{" "}
                      <span className="font-mono text-lg">{otpCode}</span>
                    </p>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <Field
                    type="text"
                    name="otp"
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1
                    focus:outline-none focus:border-white transition text-lg font-mono tracking-widest"
                  />
                  <ErrorMessage
                    name="otp"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {/* Status Error */}
                {status && (
                  <p className="text-sm text-red-400 text-center">{status}</p>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-black
                  font-medium tracking-wide hover:bg-gray-200 transition
                  disabled:opacity-50"
                >
                  {isSubmitting ? "در حال تایید..." : "تایید کد"}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="text-sm text-gray-400 hover:text-white transition"
                    disabled={isSubmitting}
                  >
                    ← بازگشت به صفحه ورود
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : isSignupMode ? (
          /* حالت ثبتنام */
          <Formik<SignupFormValues>
            initialValues={signupInitialValues}
            validationSchema={signupValidationSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6 text-end">
                {/* Email */}
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="ایمیل خود را وارد کنید"
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1
                    focus:outline-none focus:border-white transition text-sm"
                  />
                  <ErrorMessage
                    name="email"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {/* Status Error */}
                {status && (
                  <p className="text-sm text-red-400 text-center">{status}</p>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-black
                  font-medium tracking-wide hover:bg-gray-200 transition
                  disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال کد تایید"}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSignupMode(false)}
                    className="text-sm text-gray-400 hover:text-white transition"
                    disabled={isSubmitting}
                  >
                    ← بازگشت به صفحه ورود
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          /* حالت لاگین */
          <Formik<LoginFormValues>
            initialValues={loginInitialValues}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6 text-end">
                {/* Email */}
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="ایمیل"
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1
                    focus:outline-none focus:border-white transition text-sm"
                  />
                  <ErrorMessage
                    name="email"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <Field
                    type="password"
                    name="password"
                    placeholder="رمز عبور"
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1
                    focus:outline-none transition text-sm"
                  />
                  <ErrorMessage
                    name="password"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {/* Status Error */}
                {status && (
                  <p className="text-sm text-red-400 text-center">{status}</p>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-black
                  font-medium tracking-wide hover:bg-gray-200 transition
                  disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ورود..." : "ورود"}
                </button>

                {/* Switch to Signup */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSignupMode(true)}
                    className="text-sm text-gray-400 hover:text-white transition"
                    disabled={isSubmitting}
                  >
                    حساب کاربری ندارید؟ ثبت نام کنید ←
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}

export default SignIn;
