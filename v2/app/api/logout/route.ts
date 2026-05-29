import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/supabase-server";
import { hashToken } from "@/lib/auth-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = (await cookies()).get("magaloko_session")?.value;
  if (token) { try { await db().from("sessions").delete().eq("token_hash", hashToken(token)); } catch { /* ignore */ } }
  const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  res.cookies.set("magaloko_session", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
