<template>
    <div class="border rounded-lg hover:bg-orange-900/40 cursor-pointer transition-all hover:shadow-md"
        :class="{ 'bg-green-100/20': recentlyAdded }" @click="$emit('add-to-hunt', suggestion)">
        <div class="p-4 flex flex-col items-center text-center">
            <!-- Game thumbnail with background -->
            <GameThumbnail :thumbnail-url="suggestion.custom_thumb || suggestion.url_thumb" :alt="suggestion.item"
                size="lg" show-gradient @image-error="handleImageError" />

            <!-- Item name and count -->
            <div class="flex justify-between items-start w-full mt-3">
                <span class="font-medium text-gold">{{ formattedItemName }}</span>
                <span class="text-xs px-2 py-1 bg-blue-100/20 text-blue-300 rounded-full">
                    x{{ suggestion.count }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatItemName } from '../../lib/utils';
import GameThumbnail from '../UI/GameThumbnail.vue';

// Define suggestion type
interface Suggestion {
    id: string;
    item: string;
    count: number;
    custom_thumb?: string;
    url_thumb?: string;
    url_background?: string;
}

const props = defineProps({
    suggestion: {
        type: Object as () => Suggestion,
        required: true
    },
    recentlyAdded: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['add-to-hunt', 'image-error']);

// Format the item name for display
const formattedItemName = computed(() => {
    return formatItemName(props.suggestion.item);
});

// Handle image loading errors
function handleImageError(type: string) {
    emit('image-error', {
        suggestionId: props.suggestion.id,
        type
    });
}
</script>
