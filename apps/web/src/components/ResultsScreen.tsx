import type { Player } from "../types/match";

type ResultsScreenProps = {
  players: Player[];
  myPlayerId: string;
  onLeave: () => void;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function ResultsScreen({ players, myPlayerId, onLeave }: ResultsScreenProps) {
  const ranked = players.slice().sort((a, b) => b.pingCount - a.pingCount);
  const winner = ranked[0];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-beige px-6 py-10">

      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-ink">Resultado</span>
        {winner && (
          <span className="mt-1 text-sm font-medium text-ink/50">
            {winner.id === myPlayerId ? (
              <span style={{ color: winner.color }} className="font-semibold">
                Você venceu!
              </span>
            ) : (
              <>
                <span style={{ color: winner.color }} className="font-semibold">
                  {winner.name}
                </span>
                {" venceu!"}
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        {ranked.map((player, index) => {
          const isMe = player.id === myPlayerId;
          const isTop3 = index < 3;

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
              style={isMe ? {
                backgroundColor: `${player.color}22`,
                outline: `2px solid ${player.color}55`,
              } : undefined}
            >
              <span
                className={`w-8 shrink-0 text-center font-extrabold ${
                  isTop3 ? "text-xl" : "text-sm text-ink/40"
                }`}
              >
                {isTop3 ? MEDALS[index] : `${index + 1}`}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span
                  className={`truncate font-semibold text-ink ${
                    isTop3 ? "text-base" : "text-sm"
                  }`}
                >
                  {player.name}
                  {isMe && (
                    <span className="ml-1.5 text-xs font-normal text-ink/40">você</span>
                  )}
                </span>
              </div>

              <span
                className={`tabular-nums font-extrabold text-ink ${
                  isTop3 ? "text-lg" : "text-sm"
                }`}
              >
                {player.pingCount}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onLeave}
        className="w-full max-w-sm cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
      >
        Sair da partida
      </button>
    </div>
  );
}
