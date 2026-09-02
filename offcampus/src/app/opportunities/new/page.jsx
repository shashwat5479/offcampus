"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = ["Placement", "Internship", "Hackathon"];

export default function NewOpportunityPage() {
  const router = useRouter();
  const [f, setF] = useState({ company: "", role: "", type: "Placement", description: "", location: "", isRemote: false, branches: "", batchYear: "", stipend: "", applyUrl: "", deadline: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit() {
    if (!f.company.trim() || !f.role.trim() || !f.applyUrl.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/opportunity/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const text = await res.text();
      let d = {}; try { d = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(d.error || `Failed (${res.status})`);
      router.push("/opportunities"); router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  const input = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent";
  const label = "mb-1 block text-xs font-medium text-subtle";

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/opportunities" className="text-subtle hover:text-ink">←</Link>
        <h1 className="text-lg font-semibold text-ink">Post an opportunity</h1>
      </div>
      <div className="flex flex-col gap-3">
        <div><label className={label}>Company</label><input className={input} value={f.company} onChange={set("company")} placeholder="Google" /></div>
        <div><label className={label}>Role</label><input className={input} value={f.role} onChange={set("role")} placeholder="SDE Intern" /></div>
        <div className="flex gap-3">
          <div className="flex-1"><label className={label}>Type</label>
            <select className={input} value={f.type} onChange={set("type")}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="flex-1"><label className={label}>Batch year</label><input className={input} value={f.batchYear} onChange={set("batchYear")} placeholder="2026" /></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1"><label className={label}>Location</label><input className={input} value={f.location} onChange={set("location")} placeholder="Bangalore" /></div>
          <div className="flex-1"><label className={label}>Stipend / CTC</label><input className={input} value={f.stipend} onChange={set("stipend")} placeholder="12 LPA" /></div>
        </div>
        <div><label className={label}>Eligible branches (comma-separated, blank = all)</label><input className={input} value={f.branches} onChange={set("branches")} placeholder="CSE, IT, ECE" /></div>
        <div><label className={label}>Apply link</label><input className={input} value={f.applyUrl} onChange={set("applyUrl")} placeholder="https://…" /></div>
        <div><label className={label}>Deadline</label><input type="datetime-local" className={input} value={f.deadline} onChange={set("deadline")} /></div>
        <div><label className={label}>Details</label><textarea rows={3} className={input} value={f.description} onChange={set("description")} placeholder="Eligibility, process, notes…" /></div>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={f.isRemote} onChange={set("isRemote")} className="h-4 w-4 accent-[rgb(var(--c-accent))]" /> Remote</label>
        {err && <p className="text-xs text-up">{err}</p>}
        <button onClick={submit} disabled={busy} className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accentInk disabled:opacity-50">{busy ? "Posting…" : "Post opportunity"}</button>
      </div>
    </div>
  );
}