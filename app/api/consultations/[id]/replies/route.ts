import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "상담신청은 연락처로 답변합니다." }, { status: 403 });
}
