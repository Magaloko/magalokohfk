import { NextRequest, NextResponse } from "next/server";
import { createDevSessionToken, cookieOptions, isLocalDevHost } from "@/lib/auth-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  if (!isLocalDevHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (user !== "mago" && user !== "codex") {
    return NextResponse.json({ error: "bad_user" }, { status: 400 });
  }
  const res = NextResponse.redirect(new URL("/mago", req.url));
  res.cookies.set("magaloko_session", createDevSessionToken(user), cookieOptions());
  return res;
}
