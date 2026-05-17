import { useState } from "react";
import { PLAYER_COLORS } from "../constants";

type Mode = "creating" | "joining";

const DURATION_OPTIONS = [
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
];

type MatchSetupModalProps = {
  mode: Mode;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  joinCode: string;
  onJoinCodeChange: (code: string) => void;
  errorMsg: string | null;
  onBack: () => void;
  onSubmit: (duration: number) => void;
};

export function MatchSetupModal({
  mode,
  playerName,
  onPlayerNameChange,
  selectedColor,
  onColorSelect,
  joinCode,
  onJoinCodeChange,
  errorMsg,
  onBack,
  onSubmit,
}: MatchSetupModalProps) {
  const [duration, setDuration] = useState(30);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-beige p-8 shadow-2xl flex flex-col gap-6">
        <h2 className="text-xl font-extrabold tracking-tight text-ink">
          {mode === "creating" ? "Nova partida" : "Entrar em partida"}
        </h2>

        <div className="flex flex-col gap-4">
          {mode === "joining" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Código da partida
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => onJoinCodeChange(e.target.value.toUpperCase())}
                className="rounded-xl border-2 border-ink/20 bg-transparent px-4 py-3 text-sm font-bold tracking-[0.2em] text-ink placeholder:text-ink/25 focus:border-ink/50 focus:outline-none uppercase"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Seu nome
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Como quer ser chamado?"
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              className="rounded-xl border-2 border-ink/20 bg-transparent px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink/25 focus:border-ink/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Sua cor
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  className="h-8 w-8 rounded-full transition-transform duration-100 hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: color,
                    outline: selectedColor === color ? `3px solid ${color}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {mode === "creating" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Duração da partida
              </label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`flex-1 rounded-xl border-2 py-2 text-sm font-bold transition-colors duration-100
                      ${duration === opt.value
                        ? "border-ink bg-ink text-beige"
                        : "border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/7"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-sm font-medium" style={{ color: "#e63946" }}>
              {errorMsg}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => onSubmit(duration)}
            className="flex-1 cursor-pointer rounded-xl border-2 border-ink bg-ink px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-beige transition-[background,border-color] duration-150 hover:bg-ink-deep active:bg-ink-deeper"
          >
            {mode === "creating" ? "Criar" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
