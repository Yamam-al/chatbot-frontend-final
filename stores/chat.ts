import { defineStore } from 'pinia'


export type ChatRole = 'user' | 'assistant'
export interface ChatMessage { id: string; role: ChatRole; content: string }


const uid = () => Math.random().toString(36).slice(2)


export const useChatStore = defineStore('chat', {
state: () => ({
messages: [] as ChatMessage[],
loading: false,
streaming: false,
error: '' as string | ''
}),
actions: {
add(role: ChatRole, content: string) {
this.messages.push({ id: uid(), role, content })
},
startAssistant() {
this.messages.push({ id: uid(), role: 'assistant', content: '' })
},
appendToLastAssistant(chunk: string) {
const last = [...this.messages].reverse().find(m => m.role === 'assistant')
if (last) last.content += chunk
},
resetError() { this.error = '' }
}
})