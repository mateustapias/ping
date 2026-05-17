import type { WebSocket } from '@fastify/websocket'
import type { Player } from './types'

// Tipos internos do servidor

export type ConnectedPlayer = Player & {
  ws: WebSocket
}

type MatchStatus = 'waiting' | 'countdown' | 'playing' | 'finished'

export type Match = {
  code: string
  players: Map<string, ConnectedPlayer>
  pingCount: number
  createdAt: Date
  hostId: string
  duration: number // seconds
  status: MatchStatus
  startedAt: Date | null
  timerId: ReturnType<typeof setTimeout> | null
}

// Estado em memória

const matches = new Map<string, Match>()

// Helpers

function generateMatchCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Funções do store

export function createMatch(player: ConnectedPlayer, duration: number): string {
  let code = generateMatchCode()
  while (matches.has(code)) {
    code = generateMatchCode()
  }

  const match: Match = {
    code,
    players: new Map([[player.id, { ...player, pingCount: 0 }]]),
    pingCount: 0,
    createdAt: new Date(),
    hostId: player.id,
    duration,
    status: 'waiting',
    startedAt: null,
    timerId: null,
  }

  matches.set(match.code, match)

  return match.code
}

export function joinMatch(code: string, player: ConnectedPlayer): Match | null {
  const match = matches.get(code)
  if (!match) return null
  if (match.status !== 'waiting') return null
  if (match.players.size >= 8) return null

  match.players.set(player.id, { ...player, pingCount: 0 })
  return match
}

export function getMatch(code: string): Match | undefined {
  return matches.get(code)
}

// Returns the match if successful, or null if the sender is not the host or match is not waiting
export function startMatch(code: string, requestingPlayerId: string): Match | null {
  const match = matches.get(code)
  if (!match) return null
  if (match.hostId !== requestingPlayerId) return null
  if (match.status !== 'waiting') return null

  // Reset all player click counts before the game begins
  for (const player of match.players.values()) {
    player.pingCount = 0
  }

  match.pingCount = 0
  match.status = 'countdown'
  match.startedAt = new Date()

  return match
}

export function finishMatch(code: string): Match | null {
  const match = matches.get(code)
  if (!match) return null

  match.status = 'finished'

  if (match.timerId !== null) {
    clearTimeout(match.timerId)
    match.timerId = null
  }

  return match
}

export function handlePing(code: string, playerId: string): number {
  const match = matches.get(code)
  if (!match) return 0
  if (match.status !== 'playing') return match.pingCount

  const player = match.players.get(playerId)
  if (player) player.pingCount += 1

  match.pingCount += 1
  return match.pingCount
}

export function removePlayer(playerId: string): Match | null {
  for (const [code, match] of matches) {
    if (match.players.has(playerId)) {
      match.players.delete(playerId)

      if (match.players.size <= 0) {
        if (match.timerId !== null) {
          clearTimeout(match.timerId)
        }
        matches.delete(code)
      }

      return match
    }
  }
  return null
}
