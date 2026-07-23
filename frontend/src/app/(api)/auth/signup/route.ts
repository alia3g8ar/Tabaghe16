// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // اعتبارسنجی اولیه
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "ایمیل معتبر وارد کنید", success: false },
        { status: 400 }
      );
    }

    // TODO: در اینجا می‌توانید:
    // 1. ایمیل را در دیتابیس ذخیره کنید
    // 2. ایمیل تأیید ارسال کنید
    // 3. به ادمین اطلاع دهید
    // 4. یا هر منطق کسب‌وکار دیگر

    console.log("درخواست ثبت‌نام جدید:", email);

    return NextResponse.json({
      message:
        "درخواست ثبت‌نام شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.",
      success: true,
    });
  } catch (error) {
    console.error("خطا در ثبت‌نام:", error);
    return NextResponse.json(
      { message: "خطای سرور", success: false },
      { status: 500 }
    );
  }
}
