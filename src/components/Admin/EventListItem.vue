<template>
  <div class="p-4 border border-streamer-text-secondary/40 rounded-lg hover:bg-orange-900/40 cursor-pointer shadow">
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <span class="text-gold font-medium">{{ formatDate(event.date) }} {{ event.name || '' }}</span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="event.open ? 'bg-green-700 text-green-200' : 'bg-gray-700 text-gray-300'"
          >
            {{ event.open ? 'Open' : 'Closed' }}
          </span>
        </div>
        <div class="flex items-center gap-4 mt-1">
          <span class="text-sm text-streamer-text-secondary">Starting Balance: {{ event.starting_balance }}$</span>
          <span class="text-sm text-streamer-text-secondary">Current Balance: {{ event.current_balance }}$</span>
          <span class="text-sm text-streamer-text-secondary flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ event.suggestions_count }} suggestions
          </span>
          <span class="text-sm text-streamer-text-secondary flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ event.hunt_items_count || 0 }} added slots
          </span>
        </div>
      </div>
      <div class="flex space-x-2 items-center">
        <button
          v-if="event.open"
          @click.stop="$emit('close-event', event.id)"
          class="px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800 shadow transition-colors duration-150 flex items-center gap-1"
          :disabled="!event.open"
          title="Close Event"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
        <button 
          @click="$emit('view-suggestions', event.id)"
          class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Suggestions
        </button>
        <button 
          @click="$emit('view-summary', event.id)"
          class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Summary
        </button>
        <button 
          @click="$emit('view-hunt-list', event.id)"
          class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Hunt Details
        </button>
        <button 
          @click="$emit('share-link', event.id)"
          class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Define props
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

// Define emits
defineEmits(['view-suggestions', 'view-summary', 'view-hunt-list', 'share-link']);

// Format date function
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
</script>
