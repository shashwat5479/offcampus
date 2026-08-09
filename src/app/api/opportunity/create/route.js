import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const b = await request.json().catch(() => ({}));
  const company = (b.company || "").trim();
  const role = (b.role || "").trim();
  const applyUrl = (b.applyUrl || "").trim();
  if (!company || !role || !applyUrl) {
    return NextResponse.json({ error: "Company, role and apply link are required." }, { status: 400 });
  }

  const opp = await prisma.opportunity.create({
    data: {
      postedById: user.id,
      company,
      role,
      type: ["Placement", "Internship", "Hackathon"].includes(b.type) ? b.type : "Placement",
      description: (b.description || "").trim() || null,
      location: (b.location || "").trim() || null,
      isRemote: !!b.isRemote,
      branches: (b.branches || "").trim() || null,
      batchYear: b.batchYear ? parseInt(b.batchYear, 10) || null : null,
      stipend: (b.stipend || "").trim() || null,
      applyUrl,
      deadline: b.deadline ? new Date(b.deadline) : null,
    },
  });
  return NextResponse.json({ ok: true, id: opp.id });
}