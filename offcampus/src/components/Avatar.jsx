const PALETTE = ["#3b5bfd", "#e8543a", "#12a150", "#b7791f", "#0c8ce9", "#c74caa", "#6d40c9", "#0aa2c0"];

function colorFor(seed = "") {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  return PALETTE[n % PALETTE.length];
}

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({ name = "?", seed, size = 36, src }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size }} className="inline-block shrink-0 rounded-full object-cover" />;
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: colorFor(seed || name), fontSize: size * 0.38 }}
    >
      {initials(name) || "?"}
    </span>
  );
}
