"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorMessage, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

import {
  EmailFormValues,
  OtpFormValues,
  CheckNameResponse,
  SendOtpResponse,
  VerifyOtpResponse,
} from "@/utils/types/login";
import { trackLogin } from "@/utils/tracking";

function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [needsName, setNeedsName] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const emailInitialValues: EmailFormValues = {
    email: "",
    name: "",
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

      // If we don't know yet whether this email needs a name, ask first.
      let required = needsName;
      if (required === null) {
        const checked = await fetchNeedsName(values.email);
        required = checked;
        if (checked !== null) setNeedsName(checked);
      }

      // New account without a name yet: ask for it before sending the code.
      if (required === true && !values.name.trim()) {
        setNeedsName(true);
        setStatus("اول اسمت رو بگو، بعدش کد رو می‌فرستیم 🙃");
        return;
      }

      const response = await fetch(`${apiUrl}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          name: values.name.trim(),
        }),
      });

      const data: SendOtpResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ارسال کد تایید ناموفق بود");
      }

      setUserEmail(values.email);
      setUserName(values.name.trim());
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
          name: userName,
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

      login(user, accessToken, refreshToken);
      trackLogin(user.email);

      router.push(
        user.role === "admin" || user.role === "owner" ? "/admin" : "/",
      );
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
    setNeedsName(null);
  };

  // Ask the backend whether this email still needs a name (new account or an
  // account that never got one). Returning users who already set a name just
  // enter their email and go straight to the code.
  const fetchNeedsName = async (email: string): Promise<boolean | null> => {
    if (!apiUrl || !email) return null;

    try {
      setCheckingName(true);
      const response = await fetch(`${apiUrl}/auth/needs-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data: CheckNameResponse = await response.json();
      return response.ok ? data.needsName : null;
    } catch {
      return null;
    } finally {
      setCheckingName(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-4">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#161616] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isOtpMode ? "کد اومده! 🥳" : "ورود به طبقه ۱۶"}
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {isOtpMode
              ? `کد ۶ رقمی رو به ${userEmail} فرستادیم، بی‌زحمت بزنش اینجا`
              : "برای ورود یا ثبت‌نام، ایمیل خود را وارد کنید"}
          </p>
        </div>

        {isOtpMode ? (
          <Formik<OtpFormValues>
            initialValues={otpInitialValues}
            validationSchema={otpValidationSchema}
            onSubmit={handleVerifyOtp}
          >
            {({ values, isSubmitting, status, handleChange, handleBlur, setFieldValue }) => (
              <Form className="space-y-6 text-end">
                <div>
                  <input
                    type="text"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="همون ۶ رقمیِ جادویی که توی ایمیلت دیدی ✨"
                    maxLength={6}
                    autoFocus
                    value={values.code ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={(e) => {
                      // اگر مرورگر با وجود autocomplete مقدار ناخواسته‌ای (مثل ایمیل) ریخته، پاکش کن
                      if (e.target.value && !/^\d{0,6}$/.test(e.target.value)) {
                        setFieldValue("code", "");
                      }
                    }}
                    className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1 focus:outline-none focus:border-white transition text-lg font-mono tracking-widest [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f0f0f] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-out_0s]"
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
            {({ values, isSubmitting, status, handleChange, handleBlur }) => (
              <Form className="space-y-6 text-end">
                <div>
                  {needsName === true && (
                    <input
                      type="text"
                      name="name"
                      placeholder="بی‌زحمت اسمتو اینجا بزار"
                      autoComplete="name"
                      autoFocus
                      value={values.name ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={255}
                      className="w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1 focus:outline-none focus:border-white transition text-sm [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f0f0f] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-out_0s]"
                    />
                  )}

                  <input
                    type="email"
                    name="email"
                    placeholder="ایمیلت رو اینجا بزن تا کد بیاد، دم‌ت گرم"
                    autoComplete="email"
                    autoFocus
                    value={values.email ?? ""}
                    onChange={(event) => {
                      handleChange(event);
                      if (needsName !== null) setNeedsName(null);
                    }}
                    onBlur={(event) => {
                      handleBlur(event);
                      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                        void fetchNeedsName(values.email);
                      }
                    }}
                    className={`w-full bg-[#0f0f0f] text-center border-b border-gray-800 py-3 px-1 focus:outline-none focus:border-white transition text-sm [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f0f0f] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-out_0s] ${
                      needsName === true ? "mt-4" : ""
                    }`}
                  />

                  {checkingName && needsName === null && (
                    <p className="mt-2 text-center text-xs text-gray-500">
                      صبر کن ببینیم حساب جدیدی یا نه...
                    </p>
                  )}

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
