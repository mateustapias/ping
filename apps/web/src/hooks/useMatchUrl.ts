import { useEffect, useRef } from 'react'

export function parseMatchCode(pathname: string): string | null {
  const m = pathname.match(/^\/match\/([A-Z0-9]{6})$/i)
  return m ? m[1].toUpperCase() : null
}

export function useMatchUrl(matchCode: string | null | undefined) {
  const fromPopstateRef = useRef(false)

  useEffect(() => {
    if (matchCode) history.pushState(null, '', `/match/${matchCode}`)
  }, [matchCode])

  function navigateToRoot() {
    if (!fromPopstateRef.current) history.pushState(null, '', '/')
    fromPopstateRef.current = false
  }

  return { fromPopstateRef, navigateToRoot }
}
