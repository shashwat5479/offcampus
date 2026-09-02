import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { opportunityId, status } = await request.json().catch(() => ({}));
  if (!opportunityId) return NextResponse.json({ error: "Missing opportunity." }, { status: 400 });

  // empty/null status = remove the application
  if (!status) {
    await prisma.opportunityApplication.deleteMany({ where: { opportunityId, userId: user.id } });
    return NextResponse.json({ ok: true, status: null });
  }
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });

  const app = await prisma.opportunityApplication.upsert({
    where: { opportunityId_userId: { opportunityId, userId: user.id } },
    update: { status },
    create: { opportunityId, userId: user.id, status },
  });
  return NextResponse.json({ ok: true, status: app.status });
}