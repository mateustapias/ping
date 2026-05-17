import type { Player } from "../types/match";

type ScoreboardProps = {
  players: Player[];
  myPlayerId: string;
};

export function Scoreboard({ players, myPlayerId }: ScoreboardProps) {
  const sorted = players.slice().sort((a, b) => b.pingCount - a.pingCount);

  return (
    <div className="flex flex-col items-center gap-1 w-full min-w-[220px]">
      {sorted.map((player) => {
        const isMe = player.id === myPlayerId;
        return (
          <div
            key={player.id}
            className="flex items-center justify-between w-full rounded-xl px-4 py-2"
            style={isMe ? {
              backgroundColor: `${player.color}20`,
              outline: `1.5px solid ${player.color}40`,
            } : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: player.color }}
              />
              <span className="text-sm font-semibold text-ink leading-none">
                {player.name}
                {isMe && (
                  <span className="ml-1.5 text-ink/40 font-normal text-xs">você</span>
                )}
              </span>
            </div>
            <span
              key={player.pingCount}
              className="animate-score-tick tabular-nums text-sm font-bold text-ink"
            >
              {player.pingCount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
