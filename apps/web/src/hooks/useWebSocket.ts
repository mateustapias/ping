import { useEffect, useRef, useState } from 'react'
import type { ClientMessage, ServerMessage } from '../types/match'

export type WsStatus = 'idle' | 'connecting' | 'open' | 'closed'

export function useWebSocket(url: string | null, onMessage: (message: ServerMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<WsStatus>('idle')

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    if (!url) {
      if (wsRef.current) {
        wsRef.current.onopen = null
        wsRef.current.onmessage = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
      queueMicrotask(() => setStatus('idle'))
      return
    }

    queueMicrotask(() => setStatus('connecting'))
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
