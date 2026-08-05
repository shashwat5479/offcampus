import { NextResponse } from "next/server";
import { getAblyRest } from "@/lib/ably";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const ably = getAblyRest();
    const tokenRequest = await ably.auth.createTokenRequest({ clientId: user.id });
    return NextResponse.json(tokenRequest);
  } catch (e) {
    return NextResponse.json({ error: "Ably token failed." }, { status: 500 });
  }
}