<template>
  <div :class="['p-3 border rounded-lg hover:bg-orange-900/40', huntItem.active ? 'bg-green-900/30 item-active' : 'bg-gray-800/40 item-inactive']">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <GameThumbnail
          :thumbnail-url="huntItem.custom_thumb"
          :alt="huntItem.item"
          size="xs"
        />
        <span class="text-gold">{{ formattedItemName }}</span>
      </div>
      <ActionButton
        @click="$emit('remove', huntItem.id)"
        variant="danger"
        size="xs"
        text="Remove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatItemName } from '../../lib/utils';
import GameThumbnail from '../UI/GameThumbnail.vue';
import ActionButton from '../UI/ActionButton.vue';

// Define hunt item type
interface HuntItem {
  id: string;
  item: string;
  custom_thumb?: string;
}

const props = defineProps({
  huntItem: {
    type: Object as () => HuntItem,
    required: true
  }
});

const emit = defineEmits(['remove']);

// Format the item name for display
const formattedItemName = computed(() => {
  return formatItemName(props.huntItem.item);
});
</script>

<style scoped>
.item-active {
  /* Optionally override or extend Tailwind styles here */
}
.item-inactive {
  opacity: 0.7;
}
</style>
