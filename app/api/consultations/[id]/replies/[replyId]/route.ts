import { NextResponse } from "next/server";

function disabled() {
  return NextResponse.json({ error: "상담신청은 연락처로 답변합니다." }, { status: 403 });
}

export async function PATCH() {
  return disabled();
}

export async function DELETE() {
  return disabled();
}
