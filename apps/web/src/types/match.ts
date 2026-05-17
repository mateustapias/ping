// ─── Mensagens: Cliente → Servidor ───────────────────────────────────────────

type CreateMatchMessage = {
  type: 'create_match'
  payload: {
    playerName: string
    color: string
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

type PingMessage = {
  type: 'ping'
}

type LeaveMatchMessage = {
  type: 'leave_match'
}

export type ClientMessage = CreateMatchMessage | JoinMatchMessage | PingMessage | LeaveMatchMessage

// Mensagens: Servidor → Cliente

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
  }
}

export type MatchStateMessage = {
  type: 'match_state'
  payload: {
    matchCode: string
    players: Player[]
    pingCount: number
    myPlayerId: string
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
  | ErrorMessage

// Estado local da partida (frontend)

export type MatchState = {
  matchCode: string;
  players: Player[];
  pingCount: number;
  myPlayerId: string;
};

export type UIScreen = "idle" | "creating" | "joining";
