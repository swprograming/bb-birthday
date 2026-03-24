import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const anniversaryDate = new Date("2025-12-23T00:00:00");
const HER_BIRTHDAY_MONTH = 3; // March (1-indexed)
const HER_BIRTHDAY_DAY = 25;

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeTogether = {
  isStarted: boolean;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Confetti = {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
};

type Heart = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  emoji: string;
};

type HugRipple = { id: number; x: number; y: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeTogether(): TimeTogether {
  const now = new Date();
  const diff = now.getTime() - anniversaryDate.getTime();
  if (diff < 0)
    return { isStarted: false, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    isStarted: true,
    months: Math.floor(totalSeconds / (30 * 24 * 60 * 60)),
    days: Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60)),
    hours: Math.floor((totalSeconds % (24 * 60 * 60)) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function extractPhotoNumber(path: string) {
  const match = path.match(/photo(\d+)/i);
  return match ? Number(match[1]) : 9999;
}

function makeConfetti(count = 80): Confetti[] {
  const colors = ["#c084fc", "#f472b6", "#fb7185", "#a78bfa", "#fcd34d", "#34d399", "#60a5fa"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 1.2,
    duration: 2.5 + Math.random() * 2,
    rotation: Math.random() * 720 - 360,
  }));
}

function makeHearts(count = 14): Heart[] {
  const emojis = ["💜", "🩷", "💕", "✨", "🌸", "💫", "🎀"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 3 + Math.random() * 94,
    size: 18 + Math.random() * 22,
    delay: Math.random() * 6,
    duration: 7 + Math.random() * 6,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  }));
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ConfettiLayer({ pieces }: { pieces: Confetti[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--r, 360deg)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function FloatingHearts({ hearts }: { hearts: Heart[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            left: `${h.x}%`,
            bottom: "-60px",
            fontSize: h.size,
            animation: `floatUp ${h.duration}s ${h.delay}s ease-in-out infinite`,
            opacity: 0,
          }}
        >
          {h.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          15%  { opacity: 0.9; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(-110vh) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ScratchCard({ message }: { message: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const W = 320, H = 140;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#c4b5fd");
    grad.addColorStop(0.5, "#e9d5ff");
    grad.addColorStop(1, "#c4b5fd");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 15px serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Scratch here ✨", W / 2, H / 2 + 6);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 38;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    lastPos.current = { x, y };

    const data = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
    const pct = (cleared / (W * H)) * 100;
    setScratchPercent(pct);
    if (pct > 60) setRevealed(true);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{ width: W, maxWidth: "100%", touchAction: "none" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 px-4 text-center"
          style={{ zIndex: 0 }}
        >
          <p className="text-base font-bold text-purple-900 leading-6">{message}</p>
        </div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ position: "relative", zIndex: 1, display: revealed ? "none" : "block", cursor: "crosshair", width: "100%", height: "auto" }}
          onMouseDown={(e) => { setScratching(true); lastPos.current = null; scratch(...Object.values(getPos(e, canvasRef.current!)) as [number, number]); }}
          onMouseMove={(e) => { if (scratching) scratch(...Object.values(getPos(e, canvasRef.current!)) as [number, number]); }}
          onMouseUp={() => { setScratching(false); lastPos.current = null; }}
          onMouseLeave={() => { setScratching(false); lastPos.current = null; }}
          onTouchStart={(e) => { e.preventDefault(); setScratching(true); lastPos.current = null; scratch(...Object.values(getPos(e, canvasRef.current!)) as [number, number]); }}
          onTouchMove={(e) => { e.preventDefault(); if (scratching) scratch(...Object.values(getPos(e, canvasRef.current!)) as [number, number]); }}
          onTouchEnd={() => { setScratching(false); lastPos.current = null; }}
        />
        {revealed && (
          <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 px-4 py-6 text-center" style={{ minHeight: H }}>
            <p className="text-base font-bold text-purple-900 leading-6">{message}</p>
          </div>
        )}
      </div>
      {!revealed && (
        <p className="text-xs text-purple-400 font-medium">
          {scratchPercent < 20 ? "Scratch the card above 🎴" : scratchPercent < 50 ? "Keep going... 💜" : "Almost there..."}
        </p>
      )}
      {revealed && <p className="text-xs text-purple-500 font-semibold animate-bounce">💜 Message revealed!</p>}
    </div>
  );
}

function HugButton() {
  const [hugged, setHugged] = useState(false);
  const [ripples, setRipples] = useState<HugRipple[]>([]);
  const [hugCount, setHugCount] = useState(0);

  const handleHug = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - btn.left;
    const y = e.clientY - btn.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    setHugged(true);
    setHugCount((c) => c + 1);
    setTimeout(() => setHugged(false), 1200);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleHug}
        className="relative overflow-hidden rounded-full px-8 py-4 font-bold text-white shadow-2xl transition-transform active:scale-95"
        style={{
          background: hugged
            ? "linear-gradient(135deg, #a855f7, #ec4899)"
            : "linear-gradient(135deg, #7c3aed, #db2777)",
          fontSize: 18,
          minWidth: 200,
          transform: hugged ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s, background 0.3s",
        }}
      >
        {ripples.map((rp) => (
          <span
            key={rp.id}
            style={{
              position: "absolute",
              left: rp.x,
              top: rp.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.6)",
              animation: "ripple 0.7s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        ))}
        {hugged ? "🤗 Hugging you!" : "💜 Send a Hug"}
      </button>
      {hugCount > 0 && (
        <p className="text-sm text-purple-600 font-semibold">
          {hugCount === 1
            ? "Hug sent! 💜"
            : hugCount < 5
              ? `${hugCount} hugs sent! 💜`
              : `${hugCount} hugs! You love him so much 💜`}
        </p>
      )}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 1; }
          100% { transform: scale(25); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function BirthdayGate({ onUnlock }: { onUnlock: () => void }) {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handleSubmit = () => {
    const m = parseInt(month);
    const d = parseInt(day);
    if (m === HER_BIRTHDAY_MONTH && d === HER_BIRTHDAY_DAY) {
      setUnlocking(true);
      // Give the animation time to play before officially unlocking
      setTimeout(onUnlock, 900);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(160deg, #1e0533 0%, #2d0a4e 40%, #3b0764 70%, #1a0a2e 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              borderRadius: "50%",
              background: "white",
              opacity: 0.3 + Math.random() * 0.7,
              animation: `twinkle ${1.5 + Math.random() * 3}s ${Math.random() * 3}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center transition-all ${shaking ? "animate-[shake_0.5s_ease]" : ""} ${unlocking ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          transition: unlocking ? "all 0.8s ease" : "opacity 0.3s",
        }}
      >
        <div className="text-5xl mb-4">🎂</div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Hey Beautiful</h1>
        <p className="text-purple-300 text-sm mb-6 leading-6">
          This site was made just for you 💜<br />
          Enter your birthday to unlock it
        </p>

        <div className="flex gap-3 mb-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 rounded-2xl px-3 py-3 text-sm font-semibold text-purple-900 bg-purple-50 border-2 border-transparent focus:border-purple-400 outline-none"
          >
            <option value="">Month</option>
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={31}
            placeholder="Day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-24 rounded-2xl px-3 py-3 text-sm font-semibold text-purple-900 bg-purple-50 border-2 border-transparent focus:border-purple-400 outline-none text-center"
          />
        </div>

        {error && (
          <p className="text-pink-400 text-xs font-semibold mb-3 animate-pulse">
            Hmm, that doesn't seem right 🤔 Try again!
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!month || !day}
          className="w-full rounded-2xl py-3 font-bold text-white shadow-lg transition-all disabled:opacity-40 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
        >
          Unlock My Gift 💜
        </button>

        <p className="mt-4 text-purple-400 text-xs">
          Made with love, just for BB 🌸
        </p>
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 1; } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces] = useState(() => makeConfetti(100));
  const [hearts] = useState(() => makeHearts(16));
  const [timeTogether, setTimeTogether] = useState<TimeTogether>(getTimeTogether());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  // NEW: Jukebox State
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // NEW: Your playlist
  const playlist = useMemo(() => [
    { title: "Our Love Song", file: "/music/love-song.m4a" },
    { title: "You Are My Everything", file: "/music/love-song2.mp3" },
    { title: "Beautiful BB", file: "/music/love-song3.mp3" }
  ], []);

  const photoModules = import.meta.glob("./assets/photo*.{jpg,jpeg,png,webp}", {
    eager: true,
  }) as Record<string, { default: string }>;

  const photos = useMemo(() => {
    return Object.entries(photoModules)
      .sort((a, b) => extractPhotoNumber(a[0]) - extractPhotoNumber(b[0]))
      .map(([, mod]) => mod.default);
  }, [photoModules]);

  useEffect(() => {
    const timer = setInterval(() => setTimeTogether(getTimeTogether()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = async () => {
    setUnlocked(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // Auto-play music instantly on unlock
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay was blocked by the browser until further interaction.", err);
      }
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const changeSong = (direction: "next" | "prev") => {
    let newIndex = currentSongIndex;
    if (direction === "next") {
      newIndex = (currentSongIndex + 1) % playlist.length;
    } else {
      newIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    }
    setCurrentSongIndex(newIndex);

    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(() => setIsPlaying(false));
      }, 50);
    }
  };

  return (
    <>
      {!unlocked && <BirthdayGate onUnlock={handleUnlock} />}

      {unlocked && (
        <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-pink-50 text-slate-800 pb-20">

          <audio
            ref={audioRef}
            src={playlist[currentSongIndex].file}
            preload="metadata"
            playsInline
            onEnded={() => changeSong("next")}
          />

          {showConfetti && <ConfettiLayer pieces={confettiPieces} />}
          <FloatingHearts hearts={hearts} />

          <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute left-[-40px] top-10 h-40 w-40 rounded-full bg-purple-300/30 blur-3xl" />
            <div className="absolute right-[-30px] top-52 h-44 w-44 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="absolute bottom-32 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
          </div>

          {/* NEW: Floating Mini Jukebox */}
          <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center gap-3 rounded-[2rem] border border-purple-200 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-md transition-all">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-900 to-slate-800 p-1 shadow-inner ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-gray-600 bg-gray-900">
                <div className="h-3 w-3 rounded-full bg-pink-400"></div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-extrabold text-purple-900">
                {playlist[currentSongIndex].title}
              </p>
              <p className="text-xs font-semibold text-purple-500">BB's Playlist 🌸</p>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <button onClick={() => changeSong("prev")} className="p-2 text-lg transition active:scale-75">
                ⏮️
              </button>
              <button onClick={toggleMusic} className="p-2 text-2xl transition active:scale-75 drop-shadow-md">
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button onClick={() => changeSong("next")} className="p-2 text-lg transition active:scale-75">
                ⏭️
              </button>
            </div>
          </div>

          <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 z-10">
            <div className="rounded-[2rem] bg-white/80 p-5 shadow-xl backdrop-blur sm:p-8">
              <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                Happy Birthday Bezawit 💜
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-purple-900 sm:text-5xl">
                For my beautiful<br />BB
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">
                I made this little website for you so you can scroll through our memories, feel my love in every section, and know how special you are to me every single day.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="#gallery" className="rounded-2xl bg-purple-700 px-5 py-3 text-center font-semibold text-white shadow-lg">See Our Memories</a>
                <a href="#counter" className="rounded-2xl bg-purple-100 px-5 py-3 text-center font-semibold text-purple-800">Time Since We Met</a>
              </div>
              {photos.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-white shadow-lg">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img src={photos[0]} alt="Bezawit" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6 z-10 relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Her Name", value: "Bezawit Nigusse" },
                { label: "Nickname", value: "BB" },
                { label: "Anniversary", value: "Dec 23, 2025" },
              ].map((c) => (
                <div key={c.label} className="rounded-3xl bg-white/80 p-5 shadow-lg backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-500">{c.label}</p>
                  <p className="mt-2 text-xl font-semibold text-purple-900">{c.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="counter" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 z-10 relative">
            <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">Our Love Counter</p>
              <h2 className="mt-3 text-3xl font-extrabold text-purple-900 sm:text-4xl">Time since we met</h2>
              {timeTogether.isStarted ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { v: timeTogether.months, l: "Months" },
                    { v: timeTogether.days, l: "Days" },
                    { v: timeTogether.hours, l: "Hours" },
                    { v: timeTogether.minutes, l: "Minutes" },
                    { v: timeTogether.seconds, l: "Seconds" },
                  ].map(({ v, l }, i) => (
                    <div key={l} className={`rounded-3xl bg-purple-100 p-4 text-center ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                      <p className="text-3xl font-extrabold text-purple-800">{v}</p>
                      <p className="mt-1 text-sm font-semibold text-purple-600">{l}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl bg-purple-50 p-6 text-center">
                  <p className="text-xl font-bold text-purple-700">Our story starts on December 23, 2025 💜</p>
                </div>
              )}
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6 z-10 relative">
            <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">A Secret Message</p>
              <h2 className="mt-2 text-3xl font-extrabold text-purple-900 mb-6">Scratch to reveal 🎴</h2>
              <ScratchCard message="You are the most beautiful thing that ever happened to me. I love you more than any words could say. Happy birthday, my BB. 💜" />
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 z-10 relative">
            <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">For When You Miss Me</p>
              <h2 className="mt-2 text-3xl font-extrabold text-purple-900 mb-6">Press for a virtual hug 💜</h2>
              <HugButton />
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6 z-10 relative">
            <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">A Letter For BB</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-purple-900 sm:text-4xl">To the girl I love the most</h2>
                </div>
                <button
                  onClick={() => setShowLetter((p) => !p)}
                  className="rounded-2xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  {showLetter ? "Hide" : "Open"}
                </button>
              </div>
              {showLetter && (
                <div className="mt-6 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
                  <p>Happy birthday, Bezawit. You are one of the most beautiful parts of my life, and I wanted to make something special just for you.</p>
                  <p>Thank you for your smile, your love, your softness, and for every little moment that turns into a memory I never want to lose.</p>
                  <p>I hope this new year of your life brings you peace, happiness, success, and everything your heart has been wishing for.</p>
                  <p className="font-semibold text-purple-800">Happy birthday my BB. I love you endlessly. 💜</p>
                </div>
              )}
            </div>
          </section>

          <section id="gallery" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 z-10 relative">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">Our Memories</p>
              <h2 className="mt-3 text-3xl font-extrabold text-purple-900 sm:text-5xl">A romantic scroll of us</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                I wanted this to feel soft and beautiful on your phone, like a long love story you can scroll through one memory at a time.
              </p>
            </div>
            {photos.length === 0 ? (
              <div className="rounded-[2rem] bg-white/80 p-8 text-center shadow-xl">
                <p className="text-xl font-bold text-purple-700">No photos found</p>
              </div>
            ) : (
              <div className="space-y-8">
                {photos.map((photo, index) => (
                  <div key={photo} className="overflow-hidden rounded-[2rem] bg-white/85 p-3 shadow-2xl backdrop-blur">
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
                      <img src={photo} alt={`Memory ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="px-2 pb-3 pt-5 sm:px-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500">Memory {index + 1}</p>
                      <h3 className="mt-2 text-2xl font-extrabold text-purple-900 sm:text-3xl">
                        {["The smile that stays in my heart", "The moments I never want to lose", "You make life softer and brighter", "My favorite person, always", "A love that keeps growing", "One of my favorite pictures of you", "A memory I will always keep"][index] ?? "Another beautiful memory of us"}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-700 sm:text-lg">
                        {["Every time I look at you, I remember how lucky I am to have someone this special in my life.", "The little memories with you mean so much to me, even the quiet ones.", "Your presence makes ordinary days feel warm, beautiful, and unforgettable.", "You are my comfort, my happiness, and one of the best things that ever happened to me.", "The more time passes, the more I realize how deeply I care about you.", "This picture always makes me smile because it reminds me how beautiful you are.", "Another moment that reminds me how lucky I am to have you in my life."][index] ?? "This is another beautiful piece of our story together."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 z-10 relative">
            <div className="rounded-[2rem] bg-purple-900 px-6 py-12 text-center text-white shadow-2xl sm:px-10 sm:py-14">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-200">Forever Message</p>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">
                I would still choose you<br />every single time
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-purple-100 sm:text-lg">
                This website is only a small gift, but the love behind it is real. Happy birthday, Bezawit. You will always be my BB. 💜
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}