import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, allowedAreas } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await getSession();
  return NextResponse.json({
    authenticated: !!sess,
    role: sess?.tgRole || null,
    admin: isAdmin(sess),
    areas: sess ? (isAdmin(sess) ? [] : allowedAreas(sess)) : [],
  });
}
