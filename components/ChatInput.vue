<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits<{ (e: 'send', text: string): void }>()
const text = ref('')


const onSend = () => {
const t = text.value.trim()
if (!t) return
emit('send', t)
text.value = ''
}
</script>


<template>
<v-text-field
v-model="text"
variant="outlined"
placeholder="Schreib deine Frage…"
hide-details
@keydown.enter.exact.prevent="onSend"
append-inner-icon="mdi-send"
@click:append-inner="onSend"
/>
</template>