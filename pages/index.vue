<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { NLayout, NLayoutHeader, NLayoutContent, NCard, NInput, NButton, NSpace, NText } from 'naive-ui'
import { useStreamChat } from '../composables/useStreamChat'
import { useMarkdown } from '../composables/useMarkdown'
const { render } = useMarkdown()


type Msg = { role: 'user'|'assistant'|'system', content: string }

const messages = ref<Msg[]>([])
const input = ref('')
const isTyping = ref(false)
const { streamChat, abort } = useStreamChat()

const listRef = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
  if (!listRef.value) return
  listRef.value.scrollTop = listRef.value.scrollHeight
}

watch(messages, () => nextTick(scrollToBottom))

const send = async () => {
  const text = input.value.trim()
  if (!text) return

  input.value = ''
  messages.value.push({ role: 'user', content: text })

  // Platzhalter anhängen und Index sicher bekommen
  const idx = messages.value.push({ role: 'assistant', content: '' }) - 1

  await streamChat(
  { messages: messages.value, endpoint: '/stream' },
  {
    onChunk: (t) => { handleChunk(idx, t); nextTick(scrollToBottom) },
    onTyping: (v) => { isTyping.value = v },
    onError: (e) => { handleChunk(idx, `\n[Fehler] ${(e as any)?.message ?? 'Stream'}`) },
    onDone: () => { isTyping.value = false }
  }
)
}
const handleChunk = (idx: number, t: string) => {
  const m = messages.value[idx]
  if (!m) return
  messages.value[idx] = { ...m, content: (m.content ?? '') + t } // immutable!
}



onMounted(scrollToBottom)
</script>

<template>
  <NLayout class="h-screen">
    <NLayoutHeader class="px-4 flex items-center border-b h-16">
      <NText strong>Schul-Chatbot für einfache Sprache (MVP)</NText>
      <div class="ml-auto">
        <NButton tertiary size="small" @click="abort">Stop</NButton>
      </div>
    </NLayoutHeader>

    <ClientOnly fallback="Lädt …">

    <!-- Column-Layout: Content (scrollbar) + Footer (Input) -->
    <NLayoutContent class="flex flex-col h-[calc(100vh-64px)]">
      <!-- Chatverlauf -->
      <div ref="listRef" class="flex-1 overflow-auto px-4 py-3">
        <div v-for="(m, i) in messages" :key="i" class="mb-3 flex"
             :class="m.role==='user' ? 'justify-end' : 'justify-start'">
          <NCard :class="m.role==='user' ? 'bg-blue-600 text-white' : ''"
                :embedded="true" size="small" style="max-width: 75%; white-space: pre-wrap;">
            <small class="opacity-70 block mb-1">{{ m.role==='user' ? 'Du' : 'Bot' }}</small>

            <!-- User-Text normal, Bot-Text als Markdown gerendert -->
            <div v-if="m.role==='user'">{{ m.content }}</div>
            <div v-else class="md" v-html="render(m.content)"></div>
          </NCard>
        </div>

        <!-- Tippen-Indicator -->
        <div v-if="isTyping" class="text-xs opacity-60 px-1">Bot tippt …</div>
      </div>

      <!-- Footer: Eingabe + Button (immer unten) -->
      <div class="border-t px-4 py-3 flex justify-center">
        <NSpace justify="center" align="center">
          <NInput
            v-model:value="input"
            type="textarea"
            placeholder="Schreib deine Frage…"
            autosize
            class="inputWide"
            @keydown.enter.exact.prevent="send"
          />
          <NButton type="primary" @click="send">Senden</NButton>
        </NSpace>
      </div>
    </NLayoutContent>
    </ClientOnly>
  </NLayout>
</template>

<style scoped>
.h-screen { height: 100vh; }
.flex { display: flex }
.flex-1 { flex: 1 1 auto }
.flex-col { flex-direction: column }
.items-center { align-items: center ; text-align: center;}
.justify-start { justify-content: flex-start }
.justify-end { justify-content: flex-end }
.ml-auto { margin-left: auto }
.px-4 { padding-left: 1rem; padding-right: 1rem }
.py-3 { padding-top: 1rem; padding-bottom: 1rem }
.mb-3 { margin-bottom: .75rem }
.border-b { border-bottom: 1px solid #eee }
.border-t { border-top: 1px solid #eee }
.overflow-auto { overflow: auto }
.bg-blue-600 { background: #2563eb }
.text-white { color: #fff }
.opacity-60 { opacity: .6 }
.opacity-70 { opacity: .7 }
.h-\[calc\(100vh-64px\)\] { height: calc(100vh - 64px) } /* Header 64px */
.justify-center { justify-content: center }
.inputWide { 
  width: 50vw;          /* angenehme Breite */
  max-width: 720px;     /* nicht zu groß auf Desktops */
  min-width: 280px;     /* nicht zu klein auf Mobile */
}
.md {
  line-height: 1.2;
  margin: 0;
}


</style>
