import { NextRequest, NextResponse } from "next/server";
import { CHANNEL_COOKIE, DEFAULT_CHANNEL_SLUG, requestChannelParam } from "@/config/channels";

const channelCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const requested = requestChannelParam(request.nextUrl.searchParams);
  const existing = request.cookies.get(CHANNEL_COOKIE)?.value;
  if (requested) {
    response.cookies.set(CHANNEL_COOKIE, requested, channelCookieOptions);
  } else if (!existing) {
    response.cookies.set(CHANNEL_COOKIE, DEFAULT_CHANNEL_SLUG, channelCookieOptions);
  }
  return response;
}

export const config = {
  matcher: ["/", "/signup", "/login", "/mypage", "/partners/:path*", "/api/partners/:path*", "/api/member/:path*"],
};
