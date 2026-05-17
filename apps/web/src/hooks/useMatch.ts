import { useEffect, useRef, useState } from 'react'
import { WS_URL } from '../constants'
import type { ClientMessage, MatchState } from '../types/match'
import { useWebSocket } from './useWebSocket'

export function useMatch(onError: (message: string) => void) {
  const [match, setMatch] = useState<MatchState | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [wsEnabled, setWsEnabled] = useState(false)

  const pendingMessageRef = useRef<ClientMessage | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameEndTimeRef = useRef<number | null>(null)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  })

  function clearCountdown() {
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }

  function clearTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    gameEndTimeRef.current = null
  }

  useEffect(() => () => { clearCountdown(); clearTimer() }, [])

  const { sendMessage, status } = useWebSocket(wsEnabled ? WS_URL : null, (msg) => {
    if (msg.type === 'match_created') {
      const { matchCode, player, hostId, duration } = msg.payload
      setMatch({ matchCode, players: [player], pingCount: 0, myPlayerId: player.id, hostId, duration, phase: 'waiting' })
    }

    if (msg.type === 'match_state') {
      const { matchCode, players, pingCount, myPlayerId, hostId, duration } = msg.payload
      setMatch({ matchCode, players, pingCount, myPlayerId, hostId, duration, phase: 'waiting' })
    }

    if (msg.type === 'player_joined') {
      setMatch(prev => prev ? { ...prev, players: [...prev.players, msg.payload.player] } : prev)
    }

    if (msg.type === 'player_left') {
      setMatch(prev => {
        if (!prev || prev.phase === 'finished') return prev
        return { ...prev, players: prev.players.filter(p => p.id !== msg.payload.playerId) }
      })
    }

    if (msg.type === 'match_update') {
      setMatch(prev => prev ? { ...prev, pingCount: msg.payload.pingCount, players: msg.payload.players } : prev)
    }

    if (msg.type === 'match_started') {
      clearCountdown()
      clearTimer()
      const { duration } = msg.payload
      setCountdown(3)
      setTimeLeft(duration)
      setMatch(prev => prev ? { ...prev, phase: 'countdown', players: msg.payload.players, pingCount: 0 } : prev)

      let tick = 3
      countdownRef.current = setInterval(() => {
        tick -= 1
        if (tick <= 0) {
          clearCountdown()
          setCountdown(null)
          setMatch(prev => prev ? { ...prev, phase: 'playing' } : prev)

          gameEndTimeRef.current = Date.now() + duration * 1000
          timerRef.current = setInterval(() => {
            const remaining = Math.max(0, (gameEndTimeRef.current! - Date.now()) / 1000)
            setTimeLeft(remaining)
            if (remaining <= 0) clearTimer()
          }, 10)
        } else {
          setCountdown(tick)
        }
      }, 1000)
    }

    if (msg.type === 'match_finished') {
      clearCountdown()
      clearTimer()
      setCountdown(null)
      setTimeLeft(null)
      setMatch(prev => prev ? { ...prev, phase: 'finished', players: msg.payload.players } : prev)
    }

    if (msg.type === 'error') {
      onErrorRef.current(msg.payload.message)
    }
  })

  // Flush the queued create/join message once the connection opens.
  useEffect(() => {
    if (status === 'open' && pendingMessageRef.current) {
      sendMessage(pendingMessageRef.current)
      pendingMessageRef.current = null
    }
  }, [status, sendMessage])

  // Queue a message and open the WebSocket. Used for the initial create/join.
  function connect(message: ClientMessage) {
    pendingMessageRef.current = message
    setWsEnabled(true)
  }

  // Send leave_match, close the socket, and reset all match state.
  function disconnect() {
    clearCountdown()
    clearTimer()
    setCountdown(null)
    setTimeLeft(null)
    sendMessage({ type: 'leave_match' })
    setWsEnabled(false)
    setMatch(null)
  }

  return { match, countdown, timeLeft, wsStatus: status, connect, sendMessage, disconnect }
}
