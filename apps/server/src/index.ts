import fastifyWebsocket from '@fastify/websocket'
import type { WebSocket } from '@fastify/websocket'
import Fastify from 'fastify'
import { createMatch, joinMatch, getMatch, handlePing, removePlayer } from './store'
import type { ConnectedPlayer, Match } from './store'
import type { ClientMessage, Player, ServerMessage } from './types'

const app = Fastify({ logger: true })
await app.register(fastifyWebsocket)

// Helpers

function serializePlayer(player: ConnectedPlayer): Player {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    pingCount: player.pingCount,
  }
}

function broadcast(match: Match, message: ServerMessage) {
  const data = JSON.stringify(message)
  for (const player of match.players.values()) {
    if (player.ws.readyState === 1) {
      player.ws.send(data)
    }
  }
}

function broadcastExcept(match: Match, excludeId: string, message: ServerMessage) {
  const data = JSON.stringify(message)
  for (const player of match.players.values()) {
    if (player.id !== excludeId && player.ws.readyState === 1) {
      player.ws.send(data)
    }
  }
}

function send(ws: WebSocket, message: ServerMessage) {
  ws.send(JSON.stringify(message))
}

// Rotas

app.get('/health', async () => {
  return { status: 'ok' }
})

app.get('/ws', { websocket: true }, (socket) => {
  let matchCode: string | null = null
  let playerId: string | null = null

  socket.on('message', (raw) => {
    let msg: ClientMessage

    try {
      msg = JSON.parse(raw.toString()) as ClientMessage
    } catch {
      send(socket, { type: 'error', payload: { message: 'Mensagem inválida.' } })
      return
    }

    if (msg.type === 'create_match') {
      playerId = crypto.randomUUID()
      const player: ConnectedPlayer = {
        id: playerId,
        name: msg.payload.playerName,
        color: msg.payload.color,
        pingCount: 0,
        ws: socket,
      }

      matchCode = createMatch(player)

      send(socket, {
        type: 'match_created',
        payload: {
          matchCode,
          player: serializePlayer(player),
        },
      })
      return
    }

    if (msg.type === 'join_match') {
      playerId = crypto.randomUUID()
      const player: ConnectedPlayer = {
        id: playerId,
        name: msg.payload.playerName,
        color: msg.payload.color,
        pingCount: 0,
        ws: socket,
      }

      const match = joinMatch(msg.payload.code, player)

      if (!match) {
        send(socket, { type: 'error', payload: { message: 'Partida não encontrada.' } })
        return
      }

      matchCode = match.code

      send(socket, {
        type: 'match_state',
        payload: {
          matchCode: match.code,
          players: [...match.players.values()].map(serializePlayer),
          pingCount: match.pingCount,
          myPlayerId: player.id,
        },
      })

      broadcastExcept(match, player.id, {
        type: 'player_joined',
        payload: { player: serializePlayer(player) },
      })
      return
    }

    if (msg.type === 'ping') {
      if (!matchCode || !playerId) return

      const newCount = handlePing(matchCode, playerId)

      const match = getMatch(matchCode)
      if (!match) return

      broadcast(match, {
        type: 'match_update',
        payload: {
          pingCount: newCount,
          playerId,
          players: [...match.players.values()].map(serializePlayer),
        },
      })
      return
    }

    if (msg.type === 'leave_match') {
      if (!playerId) return

      const match = removePlayer(playerId)

      if (match) {
        broadcast(match, {
          type: 'player_left',
          payload: { playerId },
        })
      }

      matchCode = null
      playerId = null
      return
    }
  })

  socket.on('close', () => {
    if (!playerId) return

    const match = removePlayer(playerId)

    if (match) {
      broadcast(match, {
        type: 'player_left',
        payload: { playerId },
      })
    }
  })
})

// Start

app.listen({ port: 3333, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
