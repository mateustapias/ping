import { useEffect, useRef, useState } from 'react'
import type { ClientMessage, ServerMessage } from '../types/match'

type Status = 'connecting' | 'open' | 'closed'

export function useWebSocket(url: string, onMessage: (message: ServerMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<Status>('connecting')

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket conectado')
      setStatus('open')
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as ServerMessage
        onMessageRef.current(parsed)
      } catch {
        console.error('Mensagem inválida recebida do servidor:', event.data)
      }
    }

    ws.onclose = () => setStatus('closed')

    ws.onerror = (event) => console.error('Erro no WebSocket:', event)

    return () => {
      ws.onopen = null
      ws.onmessage = null
      ws.onerror = null
      ws.onclose = null
      ws.close()
    }
  }, [url])

  function sendMessage(message: ClientMessage) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return { sendMessage, status }
}
