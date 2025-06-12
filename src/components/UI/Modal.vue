<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        class="bg-brown-dark border-2 border-orange rounded-xl shadow-lg p-6"
        :class="[sizeClass]"
        @click.stop
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-display text-gold">
            <slot name="header">{{ title }}</slot>
          </h3>
          <button 
            v-if="showCloseButton" 
            @click="close"
            class="text-gold hover:text-orange-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="mb-6">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-end gap-3">
          <slot name="footer">
            <ActionButton 
              v-if="showCancelButton" 
              @click="cancel" 
              text="Cancel" 
              variant="secondary"
              size="md"
            />
            <ActionButton 
              v-if="showConfirmButton" 
              @click="confirm" 
              :text="confirmText" 
              variant="primary"
              size="md"
            />
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ActionButton from './ActionButton.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Modal'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  }
});

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm']);

// Close the modal
function close() {
  emit('update:modelValue', false);
}

// Cancel button handler
function cancel() {
  emit('cancel');
  close();
}

// Confirm button handler
function confirm() {
  emit('confirm');
  // Note: We don't automatically close here as the parent might want to validate first
}

// Compute size class based on the size prop
const sizeClass = computed(() => {
  const sizes = {
    'sm': 'w-80 max-w-md',
    'md': 'w-96 max-w-md',
    'lg': 'w-[32rem] max-w-2xl',
    'xl': 'w-[40rem] max-w-4xl',
    'full': 'w-[90vw] max-w-7xl'
  };
  return sizes[props.size as keyof typeof sizes] || sizes.md;
});
</script>
