import { useEffect, useRef, useState, useCallback } from "react";
import relic from "./assets/relic.jpg";

const CA = "GJDvJ5rn8WhArp2GDpXHSx2oPczCH3SA9DwGGcPFpump";
const CHART = `https://pump.fun/coin/${CA}`;
const X = "https://x.com/PEPEKRIS_";
const TG = "https://t.me/PEPEKRIS";
const LORE = [
  "Every Kingdom in this world had one thing.",
  "One sacred object that no King ever sold. A crown, a sword, a ring. Kept in the dark. Oiled. Guarded. Prayed over.",
  "Empires fell. Gold lost its value. But that one object became priceless.",
  "Because you cannot forge history.",
  "$KRIS is that object. A relic from the past, minted for the future.",
];
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Gold coin rain on canvas; coins spin, pointer pushes them aside */
function CoinRain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let w, h, raf, coins = [], mx = -999, my = -999;
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(Math.min(46, Math.max(14, w / 32)));
      coins = Array.from({ length: n }, () => mk(true));
    };
    const mk = (init) => ({ x: Math.random() * w, y: init ? Math.random() * h : -20, r: 5 + Math.random() * 9, v: 0.35 + Math.random() * 0.9, ph: Math.random() * 6.28, sp: 0.02 + Math.random() * 0.04, dx: 0 });
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const k of coins) {
        k.ph += k.sp; k.y += k.v; k.x += k.dx; k.dx *= 0.94;
        const ddx = k.x - mx, ddy = k.y - my, dist = Math.hypot(ddx, ddy);
        if (dist < 110) k.dx += (ddx / (dist || 1)) * 0.6;
        if (k.y > h + 20) Object.assign(k, mk(false));
        const sx = Math.abs(Math.cos(k.ph));
        ctx.save(); ctx.translate(k.x, k.y); ctx.scale(Math.max(sx, 0.12), 1);
        const g = ctx.createLinearGradient(-k.r, -k.r, k.r, k.r);
        g.addColorStop(0, "#fff3c2"); g.addColorStop(0.5, "#e8b84a"); g.addColorStop(1, "#9a6b12");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, k.r, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "rgba(255,243,194,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, k.r * 0.62, 0, 6.283); ctx.stroke();
        ctx.restore();
      }
      if (!reduced()) raf = requestAnimationFrame(draw);
    };
    const move = (e) => { const b = c.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; };
    size(); draw();
    window.addEventListener("resize", size); window.addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener("pointermove", move); };
  }, []);
  return <canvas ref={ref} className="coins" aria-hidden="true" />;
}

/* Scroll-driven lore: words light up as you read */
function Lore() {
  const sec = useRef(null);
  const [p, setP] = useState(0);
  const words = LORE.flatMap((t, i) => t.split(" ").map((w) => ({ w, i })));
  useEffect(() => {
    const on = () => {
      const r = sec.current.getBoundingClientRect(), vh = window.innerHeight;
      setP(Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height * 0.8))));
    };
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  let last = -1;
  return (
    <section id="lore" className="lore" ref={sec} aria-labelledby="lore-h">
      <h2 id="lore-h" className="kicker">$KRIS // The King's Relic</h2>
      <div className="lore-text">
        {words.map((o, n) => {
          const br = o.i !== last; last = o.i;
          const lit = n / words.length < p;
          return (<span key={n}>{br && n > 0 && <span className="para" />}<span className={"w" + (lit ? " lit" : "") + (o.w.includes("$KRIS") ? " gold" : "")}>{o.w}</span>{" "}</span>);
        })}
      </div>
    </section>
  );
}

export default function App() {
  const [phase, setPhase] = useState(reduced() ? 2 : 0); // 0 locked, 1 opening, 2 open
  const [copied, setCopied] = useState(false);
  const hero = useRef(null);

  useEffect(() => {
    if (phase === 2) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    const a = setTimeout(() => setPhase(1), 1300), b = setTimeout(() => setPhase(2), 2500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [phase === 2]);

  const tilt = useCallback((e) => {
    if (reduced() || !hero.current) return;
    const b = hero.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    hero.current.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    hero.current.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
  }, []);
  const untilt = () => hero.current && (hero.current.style.setProperty("--rx", "0deg"), hero.current.style.setProperty("--ry", "0deg"));

  const copy = async () => {
    try { await navigator.clipboard.writeText(CA); }
    catch { const t = document.createElement("textarea"); t.value = CA; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={"app phase" + phase}>
      {phase < 2 && (
        <div className="gate" aria-hidden="true">
          <div className="door l" /><div className="door r" />
          <div className="seal"><span>👑</span><p>Opening the vault</p></div>
        </div>
      )}
      <CoinRain />
      <header className="nav">
        <a href="#top" className="logo">$KRIS</a>
        <nav aria-label="Main">
          <a href="#lore">Lore</a><a href="#vault">Contract</a><a href="#join">Join</a>
          <a className="btn small" href={CHART} target="_blank" rel="noopener noreferrer">Chart</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="live"><i /> Live on pump.fun</p>
            <h1>PEPEKRIS<span>The king's relic, minted for the future.</span></h1>
            <p className="sub">Mojopahit, trade to the moon. A relic from the past that no King ever sold.</p>
            <div className="cta">
              <a className="btn" href={CHART} target="_blank" rel="noopener noreferrer">Buy $KRIS</a>
              <a className="btn ghost" href="#lore">Read the legend</a>
            </div>
          </div>
          <div className="relic" ref={hero} onPointerMove={tilt} onPointerLeave={untilt}>
            <svg className="ring" viewBox="0 0 400 400" aria-hidden="true">
              <defs><path id="circ" d="M200,200 m-176,0 a176,176 0 1,1 352,0 a176,176 0 1,1 -352,0" /></defs>
              <text><textPath href="#circ">$KRIS ✦ THE KING'S RELIC ✦ MOJOPAHIT ✦ $KRIS ✦ THE KING'S RELIC ✦ MOJOPAHIT ✦</textPath></text>
            </svg>
            <div className="orb"><img src={relic} alt="Pepe wearing a golden Javanese crown, resting on a golden kris dagger hilt hung with coin chains" width="771" height="811" /></div>
            <div className="glow" />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div>{Array.from({ length: 2 }).map((_, k) => <span key={k}>{"👑 $KRIS  ✦  Gas awal bos!  ✦  Mojopahit  ✦  You cannot forge history  ✦  ".repeat(3)}</span>)}</div>
        </div>

        <Lore />

        <section id="vault" className="vault" aria-labelledby="v-h">
          <h2 id="v-h">Store a little in your wallet, before history closes its vault.</h2>
          <div className="ca">
            <code>{CA}</code>
            <button className="btn" onClick={copy} aria-live="polite">{copied ? "Copied" : "Copy contract"}</button>
          </div>
          <p className="note">Always verify the contract address before you trade.</p>
          <a className="btn ghost" href={CHART} target="_blank" rel="noopener noreferrer">Open chart on pump.fun</a>
        </section>

        <section id="join" className="join" aria-labelledby="j-h">
          <h2 id="j-h">Join the kingdom</h2>
          <div className="links">
            <a className="tile" href={X} target="_blank" rel="noopener noreferrer"><b>X</b><span>@PEPEKRIS_</span></a>
            <a className="tile" href={TG} target="_blank" rel="noopener noreferrer"><b>Telegram</b><span>t.me/PEPEKRIS</span></a>
          </div>
        </section>
      </main>

      <footer>
        <p>$KRIS is a meme token with no intrinsic value or promise of returns. Prices are extremely volatile and you can lose everything. This is not financial advice. Do your own research.</p>
      </footer>
    </div>
  );
}
