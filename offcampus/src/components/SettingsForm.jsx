"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { uploadFile } from "@/lib/upload";

export default function SettingsForm({ initial }) {
  const [notif, setNotif] = useState({
    notifyFollow: initial.notifyFollow ?? true,
    notifyComment: initial.notifyComment ?? true,
    notifyReply: initial.notifyReply ?? true,
    notifyVote: initial.notifyVote ?? true,
  });

  async function saveNotif(next) {
    setNotif(next);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    router.refresh();
  }
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState(initial);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const[showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setP = (k) => (e) => setPw({ ...pw, [k]: e.target.value });
  const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-ink";

  async function pickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const { url } = await uploadFile(file);
      setForm((f) => ({ ...f, avatarUrl: url }));   // or however your form stores it
    } catch (e2) {
      setErr(e2.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  async function saveProfile() {
    setErr(""); setMsg("");
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, bio: form.bio, branch: form.branch, year: form.year, avatarUrl: form.avatarUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error || "Could not save."); return; }
    setMsg("Profile saved."); router.refresh();
  }

  async function changePassword() {
    setErr(""); setMsg("");
    if (!pw.newPassword) { setErr("Enter a new password."); return; }
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pw),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error || "Could not change password."); return; }
    setMsg("Password changed."); setPw({ currentPassword: "", newPassword: "" });
  }
  
const [isPrivate, setIsPrivate] = useState(initial.isPrivate ?? false);
  async function savePrivacy(v) {
    setIsPrivate(v);
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPrivate: v }) });
    router.refresh();
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <section className="rounded-xl2 border border-line bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold">Notifications</h2>
        <div className="flex flex-col divide-y divide-line">
          {[
            ["notifyFollow", "New followers"],
            ["notifyComment", "Comments on my posts"],
            ["notifyReply", "Replies to my comments"],
            ["notifyVote", "Upvotes on my posts"],
          ].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between py-2.5 text-sm text-ink">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={notif[key]}
                onChange={(e) => saveNotif({ ...notif, [key]: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl2 border border-line bg-paper p-5">
        <h2 className="mb-1 text-sm font-semibold">Account privacy</h2>
        <label className="flex cursor-pointer items-center justify-between py-2 text-sm text-ink">
          <span>Private account <span className="text-xs text-subtle">— people must request to follow you</span></span>
          <input type="checkbox" checked={isPrivate} onChange={(e) => savePrivacy(e.target.checked)} className="h-4 w-4 accent-accent" />
        </label>
      </section>



      <section className="rounded-xl2 border border-line bg-paper p-5">
        <h2 className="mb-4 text-sm font-semibold">Profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <Avatar name={form.name || "?"} seed={form.username} src={form.avatarUrl} size={64} />
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-subtle">
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <input className={field} placeholder="Name" value={form.name} onChange={set("name")} />
          <textarea className={`${field} resize-none`} rows={3} placeholder="Bio" value={form.bio} onChange={set("bio")} />
          <div className="flex gap-3">
            <input className={field} placeholder="Branch (e.g. CSE)" value={form.branch} onChange={set("branch")} />
            <input className={field} placeholder="Year" value={form.year} onChange={set("year")} />
          </div>
          <button onClick={saveProfile} className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper">Save profile</button>
        </div>
      </section>

      <section className="rounded-xl2 border border-line bg-paper p-5">
        <h2 className="mb-4 text-sm font-semibold">Password</h2>
        {!showPw ? (
          <button onClick={() => setShowPw(true)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-subtle">Change password</button>
        ) : (
          <div className="flex flex-col gap-3">
            <input className={field} type="password" placeholder="Current password" value={pw.currentPassword} onChange={setP("currentPassword")} />
            <input className={field} type="password" placeholder="New password" value={pw.newPassword} onChange={setP("newPassword")} />
            <div className="flex gap-2">
              <button onClick={changePassword} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper">Update password</button>
              <button onClick={() => { setShowPw(false); setPw({ currentPassword: "", newPassword: "" }); }} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-subtle">Cancel</button>
            </div>
          </div>
        )}
      </section>

      {err && <p className="text-sm text-up">{err}</p>}
      {msg && <p className="text-sm text-accent">{msg}</p>}
    </div>
  );
}