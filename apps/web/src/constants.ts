export const PLAYER_COLORS = [
  "#e63946", // vermelho
  "#f4a261", // laranja
  "#e9c46a", // amarelo
  "#2a9d8f", // verde-água
  "#457b9d", // azul
  "#6a4c93", // roxo
  "#f72585", // rosa
  "#4cc9f0", // ciano
  "#80b918", // verde
  "#adb5bd", // cinza
] as const;

export const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:3333/ws";
