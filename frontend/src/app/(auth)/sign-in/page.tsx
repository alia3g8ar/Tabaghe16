"use client";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

import {
  EmailFormValues,
  OtpFormValues,
  SendOtpResponse,
  VerifyOtpResponse,
} from "@/utils/types/login";

function SignIn() {
  const router = useRouter();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const emailInitialValues: EmailFormValues = {
    email: "",
  };

  const otpInitialValues: OtpFormValues = {
    code: "",
  };

  const emailValidationSchema = Yup.object({
    email: Yup.string()
      .email("ایمیل معتبر نیست")
      .required("ایمیل اجباری است"),
  });

  const otpValidationSchema = Yup.object({
    code: Yup.string()
      .length(6, "کد باید دقیقاً ۶ رقم باشد")
      .matches(/^\d{6}$/, "فقط عدد مجاز است")
      .required("کد تایید اجباری است"),
  });

  const handleSendOtp = async (
    values: EmailFormValues,
    { setSubmitting, setStatus }: FormikHelpers<EmailFormValues>,
  ) => {
    try {
      if (!apiUrl) {
        throw new Error("آدرس API تنظیم نشده است");
      }

      const response = await fetch(`${apiUrl}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data: SendOtpResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ارسال کد تایید ناموفق بود");
      }

      setUserEmail(values.email);
      setIsOtpMode(true);
      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "خطای ناشناخته‌ای رخ داد",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (
    values: OtpFormValues,
    { setSubmitting, setStatus }: FormikHelpers<OtpFormValues>,
  ) => {
    try {
      if (!apiUrl) {
        throw new Error("آدرس API تنظیم نشده است");
      }

      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          code: values.code,
        }),
      });

      const data: VerifyOtpResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "تایید کد ناموفق بود");
      }

      if (!data.data) {
        throw new Error("اطلاعات ورود از سرور دریافت نشد");
      }

      const { accessToken, refreshToken, user } = data.data;

      // token برای سازگاری با کد فعلی پروژه نگه داشته شده است.
      localStorage.setItem("token", accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "خطای ناشناخته‌ای رخ داد",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setIsOtpMode(false);
    setUserEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-4">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#161616] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isOtpMode ? "تایید کد" : "ورود به طبقه ۱۶"}
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {isOtpMode
              ? `کد ۶ رقمی ارسال‌شده به ${userEmail} را وارد کنید`
              : "برای ورود یا ثبت‌نام، ایمیل خود را وارد کنید"}
          </p>
        </div>

        {isOtpMode ? (
          <Formik<OtpFormValues>
            initialValues={otpInitialValues}
            validationSchema={otpValidationSchema}
            onSubmit={handleVerifyOtp}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6 text-end">
                <div>
                  <Field
                    type="text"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1 focus:outline-none focus:border-white transition text-lg font-mono tracking-widest"
                  />

                  <ErrorMessage
                    name="code"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {status && (
                  <p className="text-sm text-red-400 text-center">
                    {status}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-black font-medium tracking-wide hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? "در حال تایید..." : "تایید و ورود"}
                </button>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    disabled={isSubmitting}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    ← تغییر ایمیل
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik<EmailFormValues>
            initialValues={emailInitialValues}
            validationSchema={emailValidationSchema}
            onSubmit={handleSendOtp}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6 text-end">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="ایمیل خود را وارد کنید"
                    autoComplete="email"
                    autoFocus
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1 focus:outline-none focus:border-white transition text-sm"
                  />

                  <ErrorMessage
                    name="email"
                    component="span"
                    className="mt-2 text-xs text-red-400"
                  />
                </div>

                {status && (
                  <p className="text-sm text-red-400 text-center">
                    {status}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-black font-medium tracking-wide hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال کد ورود"}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}

export default SignIn;