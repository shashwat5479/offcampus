"use client";
import { signIn } from "next-auth/react";
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
    collegeId: "",
    branch: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError("");
    if(isSignup && !form.collegeId) {setError("Select your college."); return;}
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

  const field =
    "w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="mb-6 flex items-center gap-2">
        <img src="/logo.png" alt="OffCampus" className="h-9 w-9 rounded-lg object-contain" />
        <span className="text-xl font-semibold tracking-tight text-ink">OffCampus</span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-7 shadow-gold">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {isSignup ? "Make the most of your campus" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm text-subtle">
          {isSignup ? "Join your college network in under a minute." : "Stay updated on your campus world."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {isSignup && (
            <>
              <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} />
              <input className={field} placeholder="Username" value={form.username} onChange={set("username")} />
              <select className={field} value={form.collegeId} onChange={set("collegeId")}>
                <option value="">Select your college</option>
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
          <input
            className={field}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set("password")}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {!isSignup && (
            <div className="flex justify-end -mt-1">
              <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p className="text-sm text-up">{error}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-1 rounded-full bg-accent py-3 text-sm font-semibold text-accentInk transition-opacity disabled:opacity-50"
          >
            {busy ? "Please wait…" : isSignup ? "Agree & Join" : "Sign in"}
          </button>
        </div>

        {/* divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-faint">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Google — visual now, wired live in the NextAuth slice */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/auth/bridge" })}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-canvas py-3 text-sm font-medium text-ink hover:bg-paper"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </button>

        {isSignup && (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
            By clicking Agree &amp; Join, you agree to the OffCampus Terms and Privacy Policy.
          </p>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-subtle">
        {isSignup ? (
          <>Already on OffCampus? <Link href="/login" className="font-semibold text-accent">Sign in</Link></>
        ) : (
          <>New to OffCampus? <Link href="/signup" className="font-semibold text-accent">Join now</Link></>
        )}
      </p>
    </div>
  );
}