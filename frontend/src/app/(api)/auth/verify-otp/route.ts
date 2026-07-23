import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "ایمیل و کد تایید اجباری است", success: false },
        { status: 400 }
      );
    }

    // Mock verification - در واقعیت باید از دیتابیس بررسی شود
    // برای تست، هر کد 6 رقمی قبول میشود
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      return NextResponse.json({
        message: "ثبت نام با موفقیت تکمیل شد",
        success: true,
        token: "jwt-token-new-user",
        role: "user",
      });
    }

    return NextResponse.json(
      { message: "کد تایید اشتباه است", success: false },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { message: "خطای سرور", success: false },
      { status: 500 }
    );
  }
}
