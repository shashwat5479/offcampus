"use client";
import CollegePicker from "@/components/CollegePicker";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingForm({ pending, colleges = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    name: pending.name || "",
    collegeId: "", // no pre-select — the student must pick their real college
    branch: "",
    year: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function finish() {
    if (!form.username.trim() || !form.name.trim() || busy) return;
    if (!form.collegeId) { setErr("Please select your college."); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/complete-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Failed");
      router.push("/");
      router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  const field = "w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent";

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-2xl border border-line bg-paper p-7">
        <h1 className="text-xl font-bold text-ink">Complete your profile</h1>
        <p className="mt-1 text-sm text-subtle">Signing in as {pending.email}. Just a few details to finish.</p>
        <div className="mt-5 flex flex-col gap-3">
          <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} />
          <input className={field} placeholder="Username" value={form.username} onChange={set("username")} />
          <CollegePicker value={form.collegeId} onChange={(id) => setForm((f) => ({ ...f, collegeId: id }))} />
          <div className="flex gap-3">
            <input className={field} placeholder="Branch (e.g. CSE)" value={form.branch} onChange={set("branch")} />
            <input className={field} placeholder="Year" value={form.year} onChange={set("year")} />
          </div>
          {err && <p className="text-sm text-up">{err}</p>}
          <button onClick={finish} disabled={busy} className="mt-1 rounded-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Creating…" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}