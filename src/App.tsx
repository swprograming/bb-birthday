import { useEffect, useMemo, useRef, useState } from "react";

const anniversaryDate = new Date("2025-12-23T00:00:00");

type TimeTogether = {
  isStarted: boolean;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeTogether(): TimeTogether {
  const now = new Date();
  const diff = now.getTime() - anniversaryDate.getTime();

  if (diff < 0) {
    return {
      isStarted: false,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
  const days = Math.floor(
    (totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60)
  );
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isStarted: true,
    months,
    days,
    hours,
    minutes,
    seconds,
  };
}

function extractPhotoNumber(path: string) {
  const match = path.match(/photo(\d+)/i);
  return match ? Number(match[1]) : 9999;
}

export default function App() {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>(
    getTimeTogether()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const photoModules = import.meta.glob("./assets/photo*.{jpg,jpeg,png,webp}", {
    eager: true,
  }) as Record<string, { default: string }>;

  const photos = useMemo(() => {
    return Object.entries(photoModules)
      .sort((a, b) => extractPhotoNumber(a[0]) - extractPhotoNumber(b[0]))
      .map(([, mod]) => mod.default);
  }, [photoModules]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTogether(getTimeTogether());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    } catch (error) {
      console.error("Audio play failed:", error);
      alert(
        "Your iPhone could not play this song file. Try replacing it with a new MP3 or M4A file."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-pink-50 text-slate-800">
      <audio ref={audioRef} preload="metadata" playsInline loop>
        <source src="/music/love-song.m4a" type="audio/mp4" />
        <source src="/music/love-song.mp3" type="audio/mpeg" />
      </audio>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-40px] top-10 h-40 w-40 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute right-[-30px] top-52 h-44 w-44 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute bottom-32 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <button
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-2xl transition active:scale-95"
      >
        {isPlaying ? "Pause Song ⏸️" : "Play Song 🎵"}
      </button>

      <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
        <div className="rounded-[2rem] bg-white/80 p-5 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
            Happy Birthday Bezawit 💜
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-purple-900 sm:text-5xl">
            For my beautiful
            <br />
            BB
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">
            I made this little website for you so you can scroll through our
            memories, feel my love in every section, and know how special you
            are to me every single day.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#gallery"
              className="rounded-2xl bg-purple-700 px-5 py-3 text-center font-semibold text-white shadow-lg"
            >
              See Our Memories
            </a>
            <a
              href="#counter"
              className="rounded-2xl bg-purple-100 px-5 py-3 text-center font-semibold text-purple-800"
            >
              Time Since We Met
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-white shadow-lg">
            {photos.length > 0 ? (
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={photos[0]}
                  alt="Bezawit"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-purple-50 text-center sm:h-[420px]">
                <div className="px-6">
                  <p className="text-xl font-bold text-purple-700">
                    No photos found yet
                  </p>
                  <p className="mt-2 text-slate-600">
                    Put files like photo1.jpg, photo2.jpg, photo3.jpg in
                    src/assets
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-5 shadow-lg backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-500">
              Her Name
            </p>
            <p className="mt-2 text-xl font-semibold text-purple-900">
              Bezawit
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 p-5 shadow-lg backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-500">
              Nickname
            </p>
            <p className="mt-2 text-xl font-semibold text-purple-900">BB</p>
          </div>

          <div className="rounded-3xl bg-white/80 p-5 shadow-lg backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-500">
              Anniversary
            </p>
            <p className="mt-2 text-xl font-semibold text-purple-900">
              Dec 23, 2025
            </p>
          </div>
        </div>
      </section>

      <section id="counter" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">
            Our Love Counter
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-purple-900 sm:text-4xl">
            Time since we met
          </h2>

          {!timeTogether.isStarted ? (
            <div className="mt-6 rounded-3xl bg-purple-50 p-6 text-center">
              <p className="text-xl font-bold text-purple-700">
                Our story starts on December 23, 2025 💜
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-3xl bg-purple-100 p-4 text-center">
                <p className="text-3xl font-extrabold text-purple-800">
                  {timeTogether.months}
                </p>
                <p className="mt-1 text-sm font-semibold text-purple-600">
                  Months
                </p>
              </div>

              <div className="rounded-3xl bg-purple-100 p-4 text-center">
                <p className="text-3xl font-extrabold text-purple-800">
                  {timeTogether.days}
                </p>
                <p className="mt-1 text-sm font-semibold text-purple-600">
                  Days
                </p>
              </div>

              <div className="rounded-3xl bg-purple-100 p-4 text-center">
                <p className="text-3xl font-extrabold text-purple-800">
                  {timeTogether.hours}
                </p>
                <p className="mt-1 text-sm font-semibold text-purple-600">
                  Hours
                </p>
              </div>

              <div className="rounded-3xl bg-purple-100 p-4 text-center">
                <p className="text-3xl font-extrabold text-purple-800">
                  {timeTogether.minutes}
                </p>
                <p className="mt-1 text-sm font-semibold text-purple-600">
                  Minutes
                </p>
              </div>

              <div className="col-span-2 rounded-3xl bg-purple-100 p-4 text-center sm:col-span-1">
                <p className="text-3xl font-extrabold text-purple-800">
                  {timeTogether.seconds}
                </p>
                <p className="mt-1 text-sm font-semibold text-purple-600">
                  Seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
        <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">
                A Letter For BB
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-purple-900 sm:text-4xl">
                To the girl I love the most
              </h2>
            </div>

            <button
              onClick={() => setShowLetter((prev) => !prev)}
              className="rounded-2xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {showLetter ? "Hide" : "Open"}
            </button>
          </div>

          {showLetter && (
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
              <p>
                Happy birthday, Bezawit. You are one of the most beautiful parts
                of my life, and I wanted to make something special just for you.
              </p>

              <p>
                Thank you for your smile, your love, your softness, and for
                every little moment that turns into a memory I never want to
                lose.
              </p>

              <p>
                I hope this new year of your life brings you peace, happiness,
                success, and everything your heart has been wishing for.
              </p>

              <p className="font-semibold text-purple-800">
                Happy birthday my BB. I love you endlessly. 💜
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-500">
            Our Memories
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-purple-900 sm:text-5xl">
            A romantic scroll of us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            I wanted this to feel soft and beautiful on your phone, like a long
            love story you can scroll through one memory at a time.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-[2rem] bg-white/80 p-8 text-center shadow-xl">
            <p className="text-xl font-bold text-purple-700">No photos found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {photos.map((photo, index) => (
              <div
                key={photo}
                className="overflow-hidden rounded-[2rem] bg-white/85 p-3 shadow-2xl backdrop-blur"
              >
                <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
                  <img
                    src={photo}
                    alt={`Memory ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="px-2 pb-3 pt-5 sm:px-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500">
                    Memory {index + 1}
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold text-purple-900 sm:text-3xl">
                    {index === 0 && "The smile that stays in my heart"}
                    {index === 1 && "The moments I never want to lose"}
                    {index === 2 && "You make life softer and brighter"}
                    {index === 3 && "My favorite person, always"}
                    {index === 4 && "A love that keeps growing"}
                    {index === 5 && "One of my favorite pictures of you"}
                    {index === 6 && "A memory I will always keep"}
                    {index > 6 && "Another beautiful memory of us"}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-slate-700 sm:text-lg">
                    {index === 0 &&
                      "Every time I look at you, I remember how lucky I am to have someone this special in my life."}
                    {index === 1 &&
                      "The little memories with you mean so much to me, even the quiet ones."}
                    {index === 2 &&
                      "Your presence makes ordinary days feel warm, beautiful, and unforgettable."}
                    {index === 3 &&
                      "You are my comfort, my happiness, and one of the best things that ever happened to me."}
                    {index === 4 &&
                      "The more time passes, the more I realize how deeply I care about you."}
                    {index === 5 &&
                      "This picture always makes me smile because it reminds me how beautiful you are."}
                    {index === 6 &&
                      "Another moment that reminds me how lucky I am to have you in my life."}
                    {index > 6 &&
                      "This is another beautiful piece of our story together."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="rounded-[2rem] bg-purple-900 px-6 py-12 text-center text-white shadow-2xl sm:px-10 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-200">
            Forever Message
          </p>

          <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            I would still choose you
            <br />
            every single time
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-purple-100 sm:text-lg">
            This website is only a small gift, but the love behind it is real.
            Happy birthday, Bezawit. You will always be my BB. 💜
          </p>
        </div>
      </section>
    </div>
  );
}