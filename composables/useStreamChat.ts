// composables/useStreamChat.ts — cleaner SSE client
import { useApi } from '../utils/api'

type ChatMessage = { role: string; content: string }

type StreamPayload = {
    messages: ChatMessage[]
    endpoint?: string
    method?: 'POST' | 'GET'
    body?: any
}

export const useStreamChat = () => {
  const { base } = useApi()
  let controller: AbortController | null = null
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  const setTyping = (fn: ((v: boolean) => void) | undefined, v: boolean) => {
    if (!fn) return
    fn(v)
    if (typingTimer) clearTimeout(typingTimer)
    if (v) {
      // Fällt automatisch zurück, wenn 4s lang keine neuen Frames kommen
      typingTimer = setTimeout(() => fn(false), 4000)
    }
  }

  const streamChat = async (
    payload: StreamPayload,
    {
      onChunk,
      onTyping,
      onDone,
      onError
    }: {
      onChunk: (text: string) => void
      onTyping?: (isTyping: boolean) => void
      onDone?: () => void
      onError?: (err: unknown) => void
    }
  ) => {
    controller?.abort()
    controller = new AbortController()

    try {
      const res = await fetch(`${base}${payload.endpoint ?? '/stream'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ messages: payload.messages }),
        signal: controller.signal
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // Normalisiere Zeilenenden, damit wir konsistent auf '\n\n' splitten können
        buffer = buffer.replace(/\r\n/g, '\n')

        let sepIdx: number
        while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sepIdx)
          buffer = buffer.slice(sepIdx + 2)

          const lines = frame.split('\n').map(l => l.trim())
          if (!lines.length) continue

          const event = (lines.find(l => l.startsWith('event:'))?.slice(6).trim()) || 'message'
          const dataLines = lines
            .filter(l => l.startsWith('data:'))
            .map(l => l.slice(5)) // nur der Teil nach 'data:'

          if (event === 'ping') {
            setTyping(onTyping, true)
            continue
          }

          if (event === 'done') {
            onDone?.()
            setTyping(onTyping, false)
            return
          }

          if (event === 'error') {
            const text = dataLines.join('\n')
            try {
              const obj = JSON.parse(text)
              onError?.(new Error(obj?.message || 'Stream error'))
            } catch {
              onError?.(new Error(text || 'Stream error'))
            }
            setTyping(onTyping, false)
            return
          }

          // event: message — JEDE data:-Zeile einzeln behandeln
          for (const dl of dataLines) {
            const t = dl.trim()
            if (!t) continue
            const obj = JSON.parse(t)            // wir erwarten JSON
            const delta = obj?.delta ?? ''
            if (delta) { onTyping?.(true); onChunk(delta) }
            }

        }
      }

      onDone?.()
      setTyping(onTyping, false)
    } catch (e) {
      onError?.(e)
      onDone?.()
      setTyping(onTyping, false)
    } finally {
      if (typingTimer) clearTimeout(typingTimer)
      typingTimer = null
      controller = null
    }
  }

  const abort = () => controller?.abort()

  return { streamChat, abort }
}

