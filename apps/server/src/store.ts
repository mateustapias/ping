import type { WebSocket } from '@fastify/websocket'
import type { Player } from './types'

// ─── Tipos internos do servidor ───────────────────────────────────────────────

// Jogador conectado: igual a Player dos tipos de rede, mas com a conexão WS
export type ConnectedPlayer = Player & {
  ws: WebSocket
}

export type Match = {
  code: string
  players: Map<string, ConnectedPlayer>
  pingCount: number
  createdAt: Date
}

// ─── Estado em memória ────────────────────────────────────────────────────────

const matches = new Map<string, Match>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateMatchCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ─── Funções do store ─────────────────────────────────────────────────────────

export function createMatch(player: ConnectedPlayer): string {
  let code = generateMatchCode()
  while (matches.has(code)) {
    code = generateMatchCode()
  }

  const match: Match = {
    code,
    players: new Map([[player.id, { ...player, pingCount: 0 }]]),
    pingCount: 0,
    createdAt: new Date(),
  }

  matches.set(match.code, match)

  return match.code
}

export function joinMatch(code: string, player: ConnectedPlayer): Match | null {
  const match = matches.get(code)
  if (!match) return null

  match.players.set(player.id, { ...player, pingCount: 0 })
  return match
}

export function getMatch(code: string): Match | undefined {
  return matches.get(code)
}

export function handlePing(code: string, playerId: string): number {
  const match = matches.get(code)
  if (!match) return 0

  const player = match.players.get(playerId)
  if (player) player.pingCount += 1

  match.pingCount += 1
  return match.pingCount
}

// Retorna a partida onde o jogador estava (para broadcast de player_left)
export function removePlayer(playerId: string): Match | null {
  for (const [code, match] of matches) {
    if (match.players.has(playerId)) {
      match.players.delete(playerId)

      if (match.players.size <= 0) {
        matches.delete(code)
      }

      return match
    }
  }
  return null
}
