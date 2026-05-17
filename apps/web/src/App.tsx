import { useCallback, useState } from "react";
import "./App.css";
import { MatchSetupModal } from "./components/MatchSetupModal";
import { PingButton } from "./components/PingButton";
import { Scoreboard } from "./components/Scoreboard";
import { PLAYER_COLORS, WS_URL } from "./constants";
import { useWebSocket } from "./hooks/useWebSocket";
import type { MatchState, UIScreen } from "./types/match";

function App() {
  const [uiScreen, setUIScreen] = useState<UIScreen>("idle");
  const [playerName, setPlayerName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(PLAYER_COLORS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [localCount, setLocalCount] = useState(0);

  const screen = match !== null ? "in_match" : uiScreen;

  // Server message handler

  const { sendMessage } = useWebSocket(WS_URL, (message) => {
    if (message.type === "match_created") {
      const { matchCode, player } = message.payload;
      setMatch({ matchCode, players: [player], pingCount: 0, myPlayerId: player.id });
    }

    if (message.type === "match_state") {
      const { matchCode, players, pingCount, myPlayerId } = message.payload;
      setMatch({ matchCode, players, pingCount, myPlayerId });
    }

    if (message.type === "player_joined") {
      setMatch((prev) => {
        if (!prev) return prev;
        return { ...prev, players: [...prev.players, message.payload.player] };
      });
    }

    if (message.type === "player_left") {
      setMatch((prev) => {
        if (!prev) return prev;
        return { ...prev, players: prev.players.filter((p) => p.id !== message.payload.playerId) };
      });
    }

    if (message.type === "match_update") {
      setMatch((prev) => {
        if (!prev) return prev;
        return { ...prev, pingCount: message.payload.pingCount, players: message.payload.players };
      });
    }

    if (message.type === "error") {
      setErrorMsg(message.payload.message);
    }
  });

  // Actions

  const handlePing = useCallback(() => {
    if (screen === "in_match") sendMessage({ type: "ping" });
    else setLocalCount((c) => c + 1);
  }, [screen, sendMessage]);

  const handleCreateMatch = useCallback(() => {
    if (!playerName.trim()) { setErrorMsg("Escolha um nome para continuar."); return; }
    setErrorMsg(null);
    sendMessage({ type: "create_match", payload: { playerName: playerName.trim(), color: selectedColor } });
  }, [playerName, selectedColor, sendMessage]);

  const handleJoinMatch = useCallback(() => {
    if (joinCode.trim().length !== 6) { setErrorMsg("Digite o código de 6 caracteres da partida."); return; }
    if (!playerName.trim()) { setErrorMsg("Escolha um nome para continuar."); return; }
    setErrorMsg(null);
    sendMessage({ type: "join_match", payload: { code: joinCode.trim().toUpperCase(), playerName: playerName.trim(), color: selectedColor } });
  }, [joinCode, playerName, selectedColor, sendMessage]);

  const handleLeaveMatch = useCallback(() => {
    sendMessage({ type: "leave_match" });
    setMatch(null);
    setLocalCount(0);
    setPlayerName("");
    setJoinCode("");
    setSelectedColor(PLAYER_COLORS[0]);
    setErrorMsg(null);
    setUIScreen("idle");
  }, [sendMessage]);

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-beige">

      <div className="flex flex-col items-center gap-12">
        <span
          key={match?.pingCount ?? localCount}
          className="animate-counter-pop tabular-nums text-[112px] leading-none font-extrabold tracking-[-4px] text-ink"
        >
          {match?.pingCount ?? localCount}
        </span>

        <PingButton onClick={handlePing} />

        {screen === "in_match" && match && (
          <Scoreboard players={match.players} myPlayerId={match.myPlayerId} />
        )}
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

      {screen === "idle" && (
        <div className="fixed right-7 bottom-7 left-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => { setErrorMsg(null); setUIScreen("joining"); }}
            className="cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
          >
            Entrar em partida
          </button>
          <button
            type="button"
            onClick={() => { setErrorMsg(null); setUIScreen("creating"); }}
            className="cursor-pointer rounded-xl border-2 border-ink bg-ink px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-beige transition-[background,border-color] duration-150 hover:bg-ink-deep active:bg-ink-deeper"
          >
            Nova partida
          </button>
        </div>
      )}

      {screen === "in_match" && match && (
        <div className="fixed right-7 bottom-7 left-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">Código</span>
            <span className="text-sm font-bold tracking-widest text-ink">{match.matchCode}</span>
          </div>
          <button
            type="button"
            onClick={handleLeaveMatch}
            className="cursor-pointer rounded-xl border-2 border-ink/35 bg-transparent px-5 py-[11px] text-sm font-semibold tracking-[0.3px] text-ink transition-[background,border-color] duration-150 hover:border-ink/55 hover:bg-ink/7 active:bg-ink/13"
          >
            Sair da partida
          </button>
        </div>
      )}

      {(screen === "creating" || screen === "joining") && (
        <MatchSetupModal
          mode={screen}
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          joinCode={joinCode}
          onJoinCodeChange={setJoinCode}
          errorMsg={errorMsg}
          onBack={() => { setErrorMsg(null); setUIScreen("idle"); }}
          onSubmit={screen === "creating" ? handleCreateMatch : handleJoinMatch}
        />
      )}
    </main>
  );
}

export default App;
