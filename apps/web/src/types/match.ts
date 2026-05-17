// ─── Mensagens: Cliente → Servidor ───────────────────────────────────────────

type CreateMatchMessage = {
  type: 'create_match'
  payload: {
    playerName: string
    color: string
    duration: number
  }
}

type JoinMatchMessage = {
  type: 'join_match'
  payload: {
    code: string
    playerName: string
    color: string
  }
}

type StartMatchMessage = {
  type: 'start_match'
}

type PingMessage = {
  type: 'ping'
}

type LeaveMatchMessage = {
  type: 'leave_match'
}

export type ClientMessage = CreateMatchMessage | JoinMatchMessage | StartMatchMessage | PingMessage | LeaveMatchMessage

// Messages: Server → Client

export type Player = {
  id: string
  name: string
  color: string
  pingCount: number
}

export type MatchCreatedMessage = {
  type: 'match_created'
  payload: {
    matchCode: string
    player: Player
    hostId: string
    duration: number
  }
}

export type MatchStateMessage = {
  type: 'match_state'
  payload: {
    matchCode: string
    players: Player[]
    pingCount: number
    myPlayerId: string
    hostId: string
    duration: number
  }
}

export type PlayerJoinedMessage = {
  type: 'player_joined'
  payload: {
    player: Player
  }
}

export type PlayerLeftMessage = {
  type: 'player_left'
  payload: {
    playerId: string
  }
}

export type MatchUpdateMessage = {
  type: 'match_update'
  payload: {
    pingCount: number
    playerId: string
    players: Player[]
  }
}

export type MatchStartedMessage = {
  type: 'match_started'
  payload: {
    duration: number
    players: Player[]
    startedAt: string
  }
}

export type MatchFinishedMessage = {
  type: 'match_finished'
  payload: {
    players: Player[]
  }
}

export type ErrorMessage = {
  type: 'error'
  payload: {
    message: string
  }
}

export type ServerMessage =
  | MatchCreatedMessage
  | MatchStateMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | MatchUpdateMessage
  | MatchStartedMessage
  | MatchFinishedMessage
  | ErrorMessage

// ─── Estado local da partida (frontend) ──────────────────────────────────────

export type MatchPhase = 'waiting' | 'countdown' | 'playing' | 'finished'

export type MatchState = {
  matchCode: string
  players: Player[]
  pingCount: number
  myPlayerId: string
  hostId: string
  duration: number
  phase: MatchPhase
}

export type UIScreen = 'idle' | 'creating' | 'joining'
