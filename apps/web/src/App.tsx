import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  function handlePing() {
    setCount((c) => c + 1);
    setIsPressing(true);
    setIsPulsing(true);
  }

  function handleReset() {
    setCount(0);
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-beige">
      <div className="flex flex-col items-center gap-12">
        <span
          key={count}
          className="animate-counter-pop tabular-nums text-[112px] leading-none font-extrabold tracking-[-4px] text-ink"
        >
          {count}
        </span>

        <div
          className={`ping-btn-wrapper relative flex items-center justify-center ${isPulsing ? "isPulsing" : ""}`}
          onAnimationEnd={() => setIsPulsing(false)}
        >
          <button
            type="button"
            className={`h-[196px] w-[196px] cursor-pointer rounded-full border-0 bg-ink text-xl font-bold tracking-[4px] text-beige select-none [-webkit-tap-highlight-color:transparent] shadow-[0_8px_0_#1a130c,0_14px_28px_rgba(0,0,0,0.28)] ${isPressing ? "animate-btn-press" : ""}`}
            onAnimationEnd={() => setIsPressing(false)}
            onClick={handlePing}
          >
            PING
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={count === 0}
          aria-label="Resetar contagem"
          className="cursor-pointer text-ink/35 transition-colors duration-150 hover:text-ink/70 disabled:pointer-events-none disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <a
        href="https://github.com/mateustapias"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub de Mateus Tapias"
        className="fixed top-7 right-7 flex text-ink/45 transition-colors duration-150 hover:text-ink size-7"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>

      <div className="fixed right-7 bottom-7 left-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          className="cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
        >
          Entrar em partida
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-xl border-2 border-ink bg-ink px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-beige transition-[background,border-color] duration-150 hover:bg-ink-deep active:bg-ink-deeper"
        >
          Nova partida
        </button>
      </div>
    </main>
  );
}

export default App;
