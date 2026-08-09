"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0b0d13", color: "#f0f2f6", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: 6, fontSize: 14, opacity: 0.7 }}>The app hit an unexpected error.</p>
          <button onClick={reset} style={{ marginTop: 16, borderRadius: 999, padding: "8px 16px", background: "#8b7cf6", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
} 