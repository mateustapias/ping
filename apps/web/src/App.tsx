import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { LobbyScreen } from "./components/LobbyScreen";
import { MatchSetupModal } from "./components/MatchSetupModal";
import { PingButton } from "./components/PingButton";
import { ResultsScreen } from "./components/ResultsScreen";
import { Scoreboard } from "./components/Scoreboard";
import { PLAYER_COLORS } from "./constants";
import { useMatch } from "./hooks/useMatch";
import { parseMatchCode, useMatchUrl } from "./hooks/useMatchUrl";
import type { UIScreen } from "./types/match";
import GitHub from "./assets/icons/GitHub";

function App() {
  const [uiScreen, setUIScreen] = useState<UIScreen>(() =>
    parseMatchCode(window.location.pathname) ? "joining" : "idle"
  );
  const [playerName, setPlayerName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(PLAYER_COLORS[0]);
  const [joinCode, setJoinCode] = useState(() =>
    parseMatchCode(window.location.pathname) ?? ""
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localCount, setLocalCount] = useState(0);

  const { match, countdown, timeLeft, connect, sendMessage, disconnect } =
    useMatch(setErrorMsg);

  const { fromPopstateRef, navigateToRoot } = useMatchUrl(match?.matchCode);

  const handleLeaveMatch = useCallback(() => {
    disconnect();
    setPlayerName("");
    setJoinCode("");
    setSelectedColor(PLAYER_COLORS[0]);
    setErrorMsg(null);
    setUIScreen("idle");
    setLocalCount(0);
    navigateToRoot();
  }, [disconnect, navigateToRoot]);

  useEffect(() => {
    const handlePop = () => {
      if (!parseMatchCode(window.location.pathname) && match) {
        fromPopstateRef.current = true;
        handleLeaveMatch();
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [match, handleLeaveMatch, fromPopstateRef]);

  const handlePing = useCallback(() => {
    if (match?.phase === "playing") sendMessage({ type: "ping" });
    else if (!match) setLocalCount((c) => c + 1);
  }, [match, sendMessage]);

  const handleCreateMatch = useCallback((duration: number) => {
    if (!playerName.trim()) { setErrorMsg("Escolha um nome para continuar."); return; }
    setErrorMsg(null);
    connect({ type: "create_match", payload: { playerName: playerName.trim(), color: selectedColor, duration } });
  }, [playerName, selectedColor, connect]);

  const handleJoinMatch = useCallback(() => {
    if (joinCode.trim().length !== 6) { setErrorMsg("Digite o código de 6 caracteres da partida."); return; }
    if (!playerName.trim()) { setErrorMsg("Escolha um nome para continuar."); return; }
    setErrorMsg(null);
    connect({ type: "join_match", payload: { code: joinCode.trim().toUpperCase(), playerName: playerName.trim(), color: selectedColor } });
  }, [joinCode, playerName, selectedColor, connect]);

  const handleStartMatch = useCallback(() => {
    sendMessage({ type: "start_match" });
  }, [sendMessage]);


  if (match?.phase === "waiting") {
    return (
      <LobbyScreen
        matchCode={match.matchCode}
        players={match.players}
        myPlayerId={match.myPlayerId}
        hostId={match.hostId}
        duration={match.duration}
        onStart={handleStartMatch}
        onLeave={handleLeaveMatch}
      />
    );
  }

  if (match?.phase === "finished") {
    return (
      <ResultsScreen
        players={match.players}
        myPlayerId={match.myPlayerId}
        onLeave={handleLeaveMatch}
      />
    );
  }

  const myCount = match
    ? (match.players.find((p) => p.id === match.myPlayerId)?.pingCount ?? 0)
    : localCount;

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-beige">

      <div className="flex flex-col items-center gap-12">
        {match?.phase === "playing" && timeLeft !== null && (
          <div className="flex items-baseline gap-4">
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={`tabular-nums text-5xl font-extrabold leading-none tracking-tight transition-colors duration-300 ${
                  timeLeft <= 5 ? "text-red-500" : "text-ink"
                }`}
              >
                {timeLeft.toFixed(2)}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                segundos
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="tabular-nums text-xl font-extrabold leading-none text-ink/30">
                {match.pingCount}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/25">
                total
              </span>
            </div>
          </div>
        )}

        <span
          key={myCount}
          className="animate-counter-pop tabular-nums text-[112px] leading-none font-extrabold tracking-[-4px] text-ink"
        >
          {myCount}
        </span>

        <PingButton onClick={handlePing} />

        {match?.phase === "playing" && (
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
       <GitHub className="size-7"/>
      </a>

      {/* Idle action buttons */}
      {!match && uiScreen === "idle" && (
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

      {/* In-game footer: match code + leave button */}
      {match?.phase === "playing" && (
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

      {/* Setup modals */}
      {(uiScreen === "creating" || uiScreen === "joining") && !match && (
        <MatchSetupModal
          mode={uiScreen}
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          joinCode={joinCode}
          onJoinCodeChange={setJoinCode}
          errorMsg={errorMsg}
          onBack={() => {
            setErrorMsg(null);
            setUIScreen("idle");
            if (parseMatchCode(window.location.pathname)) {
              history.pushState(null, "", "/");
            }
          }}
          onSubmit={uiScreen === "creating" ? handleCreateMatch : handleJoinMatch}
        />
      )}

      {/* Countdown overlay */}
      {match?.phase === "countdown" && countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <span
            key={countdown}
            className="animate-counter-pop text-[160px] font-extrabold leading-none tracking-[-6px] text-beige"
          >
            {countdown}
          </span>
        </div>
      )}
    </main>
  );
}

export default App;
