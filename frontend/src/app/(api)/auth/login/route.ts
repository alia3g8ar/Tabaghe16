import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email === "admin@tabaghe16.com" && password === "123456") {
      return NextResponse.json({
        token: "sample-jwt-token",
        message: "ورود موفق",
      });
    }

    return NextResponse.json(
      { message: "ایمیل یا رمز عبور اشتباه است" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
