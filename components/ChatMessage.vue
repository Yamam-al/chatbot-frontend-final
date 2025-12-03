<script setup lang="ts">
import type { ChatMessage } from '../stores/chat'
const props = defineProps<{ msg: ChatMessage }>()
</script>


<template>
<div class="mb-2" :class="props.msg.role==='user' ? 'justify-end d-flex' : 'justify-start d-flex'">
<v-sheet
:color="props.msg.role === 'user' ? 'primary' : 'surface'"
:class="['pa-3', 'rounded-xl', props.msg.role === 'user' ? 'text-white' : '']"
elevation="1"
style="max-width: 75%; white-space: pre-wrap"
>
<small class="d-block mb-1" :class="props.msg.role==='user' ? 'text-white text-opacity-80' : 'text-medium-emphasis'">
{{ props.msg.role === 'user' ? 'Du' : props.msg.role === 'assistant' ? 'Bot' : 'System' }}
</small>
<div>{{ props.msg.content }}</div>
</v-sheet>
</div>
</template>