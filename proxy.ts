import { NextRequest, NextResponse } from "next/server";
import { CHANNEL_COOKIE, resolveChannel } from "@/config/channels";

const channelCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const requested = request.nextUrl.searchParams.get("ch");
  const existing = request.cookies.get(CHANNEL_COOKIE)?.value;
  if (requested != null && requested !== "") {
    const { channel } = resolveChannel(requested);
    response.cookies.set(CHANNEL_COOKIE, channel.slug, channelCookieOptions);
  } else if (!existing) {
    response.cookies.set(CHANNEL_COOKIE, "default", channelCookieOptions);
  }
  return response;
}

export const config = {
  matcher: ["/partners/:path*", "/api/partners/:path*"],
};
