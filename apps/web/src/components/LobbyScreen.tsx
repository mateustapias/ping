import { useState } from "react";
import Copy from "../assets/icons/Copy";
import CopyCheck from "../assets/icons/CopyCheck";
import type { Player } from "../types/match";

const MAX_SLOTS = 8;

type LobbyScreenProps = {
  matchCode: string;
  players: Player[];
  myPlayerId: string;
  hostId: string;
  duration: number;
  onStart: () => void;
  onLeave: () => void;
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60}min`;
}

export function LobbyScreen({
  matchCode,
  players,
  myPlayerId,
  hostId,
  duration,
  onStart,
  onLeave,
}: LobbyScreenProps) {
  const isHost = myPlayerId === hostId;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(matchCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const slots: (Player | null)[] = [
    ...players,
    ...Array(Math.max(0, MAX_SLOTS - players.length)).fill(null),
  ];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-beige px-6 py-10">

      {/* Header */}
      <div className="flex w-full max-w-sm flex-col items-center gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
          Código da sala
        </span>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-[0.25em] text-ink">
            {matchCode}
          </span>
          <button
            type="button"
            onClick={copyCode}
            title="Copiar código"
            className="flex items-center gap-1.5 rounded-lg border-2 border-ink/20 bg-transparent px-2.5 py-1 text-xs font-semibold text-ink/50 transition-colors duration-150 hover:border-ink/40 hover:text-ink active:bg-ink/8"
          >
            {copied ? (
              <>
                <CopyCheck className="size-3.5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>
        <span className="mt-1 text-xs font-medium text-ink/40">
          Duração: {formatDuration(duration)}
        </span>
      </div>

      {/* Slots grid */}
      <div className="grid w-full max-w-sm grid-cols-4 gap-3">
        {slots.map((player, i) => (
          <div key={player?.id ?? `empty-${i}`} className="flex flex-col items-center gap-1.5">
            {player ? (
              <>
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border-2"
                  style={{ borderColor: player.color, backgroundColor: `${player.color}22` }}
                >
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  {player.id === hostId && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-beige">
                      Host
                    </span>
                  )}
                </div>
                <span className="max-w-[64px] truncate text-center text-[11px] font-semibold text-ink leading-none">
                  {player.name}
                </span>
                {player.id === myPlayerId && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-ink/35 leading-none">
                    você
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-ink/15 bg-ink/4" />
                <span className="text-[11px] font-medium text-ink/20">—</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {isHost ? (
          <button
            type="button"
            onClick={onStart}
            disabled={players.length < 1}
            className="cursor-pointer rounded-xl border-2 border-ink bg-ink px-5 py-[11px] text-sm font-bold tracking-[0.3px] text-beige transition-[background,border-color] duration-150 hover:bg-ink-deep active:bg-ink-deeper disabled:cursor-not-allowed disabled:opacity-40"
          >
            Iniciar partida
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-ink/10 bg-ink/4 px-5 py-[11px]">
            <span className="text-sm font-semibold text-ink/50">
              Aguardando o host iniciar...
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
        >
          Sair da partida
        </button>
      </div>
    </div>
  );
}
