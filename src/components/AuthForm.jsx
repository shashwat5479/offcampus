"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ mode, colleges = [] }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    collegeId: colleges[0]?.id || "",
    branch: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-ink";

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-xl2 border border-line bg-paper p-6">
      <h1 className="text-xl font-semibold tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-subtle">
        {isSignup ? "Join your campus in under a minute." : "Log in to OffCampus."}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {isSignup && (
          <>
            <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} />
            <input className={field} placeholder="Username" value={form.username} onChange={set("username")} />
            <select className={field} value={form.collegeId} onChange={set("collegeId")}>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <input className={field} placeholder="Branch (e.g. CSE)" value={form.branch} onChange={set("branch")} />
              <input className={field} placeholder="Year" value={form.year} onChange={set("year")} />
            </div>
          </>
        )}
        <input className={field} placeholder="Email" value={form.email} onChange={set("email")} />
        <input className={field} type="password" placeholder="Password" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && submit()} />

        {error && <p className="text-sm text-up">{error}</p>}

        <button onClick={submit} disabled={busy} className="mt-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
      </div>

     

      <p className="mt-4 text-center text-sm text-subtle">
        {isSignup ? (
          <>Already here? <Link href="/login" className="font-medium text-accent">Log in</Link></>
        ) : (
          <>New to OffCampus? <Link href="/signup" className="font-medium text-accent">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
