<template>
  <div class="p-3 border rounded-lg hover:bg-orange-900/40">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Game thumbnail -->
        <GameThumbnail
          :thumbnail-url="huntItem.custom_thumb"
          :background-url="huntItem.url_background"
          :alt="huntItem.item"
          size="sm"
          @image-error="handleImageError"
        />
        <span class="font-medium text-gold">{{ formattedItemName }}</span>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Wager input -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gold">Wager:</label>
          <input
            type="number"
            v-model="localItem.wager"
            class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold"
            @input="updateItem"
          />
        </div>
        
        <!-- Result input -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gold">Result:</label>
          <input
            type="number"
            v-model="localItem.result"
            class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold"
            @input="updateItem"
          />
        </div>
        
        <!-- Bonus input -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gold">Bonus:</label>
          <input
            type="checkbox"
            v-model="localItem.bonus"
            class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500"
            @change="handleBonusChange('bonus')"
          />
        </div>
        
        <!-- Super Bonus input -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gold">Super:</label>
          <input
            type="checkbox"
            v-model="localItem.super_bonus"
            class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500"
            @change="handleBonusChange('super_bonus')"
          />
        </div>
        
        <!-- Completed checkbox -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gold">Done:</label>
          <input
            type="checkbox"
            v-model="localItem.completed"
            class="form-checkbox h-5 w-5 text-orange-600 rounded border-orange-400 focus:ring-orange-500"
            @input="updateItem"
          />
        </div>
        
        <!-- Remove button -->
        <ActionButton
          icon="trash"
          variant="danger"
          size="sm"
          @click="emit('remove', props.huntItem.id)"
        />
      </div>
    </div>
    
    <!-- Balance Modal -->
    <div v-if="showBalanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-brown-dark border border-gold rounded-lg p-6 w-96 shadow-xl">
        <h3 class="text-xl font-bold text-gold mb-4">Enter Current Balance</h3>
        <div class="mb-4">
          <label class="block text-gold mb-2">Current Balance:</label>
          <input 
            type="number" 
            v-model="currentBalance" 
            class="w-full px-3 py-2 border rounded bg-brown-light text-gold"
            placeholder="Enter current balance"
          />
        </div>
        <div class="flex justify-end gap-3">
          <button 
            @click="cancelBalanceUpdate()" 
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            @click="saveBalanceUpdate()" 
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatItemName } from '../../lib/utils';
import GameThumbnail from '../UI/GameThumbnail.vue';
import ActionButton from '../UI/ActionButton.vue';

// Define hunt item type
interface HuntItem {
  id: string;
  event_id: string;
  suggestion_id: string;
  item: string;
  wager: number;
  result: number;
  bonus: boolean;
  super_bonus: boolean;
  completed: boolean;
  custom_thumb?: string;
  url_background?: string;
  current_balance?: number;
}

const props = defineProps({
  huntItem: {
    type: Object as () => HuntItem,
    required: true
  }
});

const emit = defineEmits(['update', 'remove', 'image-error']);

// Create a local copy of the hunt item to track changes
const localItem = ref<HuntItem>({ ...props.huntItem });

// Modal state
const showBalanceModal = ref(false);
const currentBalance = ref(props.huntItem.current_balance || 0);
const bonusTypeBeingUpdated = ref<'bonus' | 'super_bonus' | null>(null);
const previousBonusState = ref(false);

// Watch for changes in the props and update local state
watch(() => props.huntItem, (newItem) => {
  localItem.value = { ...newItem };
  currentBalance.value = newItem.current_balance || 0;
}, { deep: true });

// Format the item name for display
const formattedItemName = computed(() => {
  return formatItemName(props.huntItem.item);
});

// Update the hunt item when inputs change
function updateItem() {
  emit('update', { ...localItem.value });
}

// Handle bonus checkbox changes
function handleBonusChange(type: 'bonus' | 'super_bonus') {
  // Store the current state before showing modal
  previousBonusState.value = type === 'bonus' ? !localItem.value.bonus : !localItem.value.super_bonus;
  bonusTypeBeingUpdated.value = type;
  
  // If checkbox is being checked (turned on), show the modal
  if ((type === 'bonus' && localItem.value.bonus) || 
      (type === 'super_bonus' && localItem.value.super_bonus)) {
    showBalanceModal.value = true;
  } else {
    // If turning off, just update without showing modal
    updateItem();
  }
}

// Save balance and update hunt item
function saveBalanceUpdate() {
  // Update the current balance
  localItem.value.current_balance = currentBalance.value;
  
  // Update the hunt item
  updateItem();
  
  // Close the modal
  showBalanceModal.value = false;
  bonusTypeBeingUpdated.value = null;
}

// Cancel balance update and revert checkbox
function cancelBalanceUpdate() {
  // Revert the checkbox to its previous state
  if (bonusTypeBeingUpdated.value === 'bonus') {
    localItem.value.bonus = previousBonusState.value;
  } else if (bonusTypeBeingUpdated.value === 'super_bonus') {
    localItem.value.super_bonus = previousBonusState.value;
  }
  
  // Close the modal
  showBalanceModal.value = false;
  bonusTypeBeingUpdated.value = null;
}

// Handle image loading errors
function handleImageError(type: string) {
  emit('image-error', { 
    huntItemId: props.huntItem.id, 
    type 
  });
}
</script>
