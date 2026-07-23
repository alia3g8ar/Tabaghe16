import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "ایمیل اجباری است", success: false },
        { status: 400 }
      );
    }

    // تولید کد 6 رقمی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Mock signup - در واقعیت باید ایمیل ارسال شود
    console.log(`کد تایید برای ${email}: ${otpCode}`);
    
    return NextResponse.json({
      message: "کد تایید به ایمیل شما ارسال شد",
      success: true,
      otpCode // فقط برای تست - در production حذف شود
    });
  } catch {
    return NextResponse.json(
      { message: "خطای سرور", success: false },
      { status: 500 }
    );
  }
}
