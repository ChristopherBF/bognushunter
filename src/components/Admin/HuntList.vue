<template>
  <div class="space-y-6">
    <div class="bg-brown rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 text-gold">Hunt List</h2>
      
      <div v-if="loading" class="flex justify-center my-8">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="huntList.length > 0" class="space-y-4">
        <HuntListItem
          v-for="huntItem in huntList"
          :key="huntItem.id"
          :hunt-item="huntItem"
          @update="updateHuntItem"
          @remove="removeHuntItem"
        />
      </div>
      <div v-else class="text-center py-8">
        <p class="text-gold">No items in the hunt list yet.</p>
        <p class="text-gold mt-2">
          Add items from the <a :href="`${basePath}suggestions/${props.eventId}`" class="text-blue-500 underline">Suggestions page</a>.
        </p>
      </div>

    </div>
    <!-- Summary section -->
    <div v-if="huntList.length > 0" class="mt-8 p-4 border rounded-lg bg-brown border-orange">
      <h3 class="text-lg font-semibold mb-2 text-gold">Hunt Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="p-3 bg-brown rounded shadow">
          <div class="text-sm text-gold">Total Items</div>
          <div class="text-xl font-bold">{{ huntList.length }}</div>
        </div>
        <div class="p-3 bg-brown rounded shadow">
          <div class="text-sm text-gold">Total Result</div>
          <div class="text-xl font-bold">{{ calculateTotalResult() }}</div>
        </div>
        <div class="p-3 bg-brown rounded shadow">
          <div 
            :class="[
              'text-xl font-bold', 
              calculateProfit() > 0 
                ? 'text-green-600' 
                : calculateProfit() < 0 
                  ? 'text-red-600' 
                  : ''
            ]"
          >
            <div class="text-sm text-gold">Profit/Loss</div>
            {{ calculateProfit() > 0 ? '+' : '' }}{{ calculateProfit() }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-4 p-3 bg-brown rounded shadow mb-4">
        <div class="flex-1 flex items-center gap-2">
          <label class="text-sm text-gold">Starting Balance:</label>
          <input
            type="number"
            v-model="startingBalance"
            class="w-32 px-2 py-1 border rounded bg-brown-dark text-gold"
            @input="updateStartingBalance"
            placeholder="Enter starting balance"
          />
        </div>
        <!-- <div class="flex-1 flex items-center gap-2">
          <label class="text-sm text-gold">Current Balance:</label>
          <input
            type="number"
            v-model="currentBalance"
            class="w-32 px-2 py-1 border rounded bg-brown-dark text-gold"
            @input="updateCurrentBalance"
            placeholder="Enter current balance"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { formatItemName } from '../../lib/utils';
import { showSuccess, showError, showInfo } from '../../lib/toast';
import { fetchHuntList as fetchHuntListService, updateHuntItem as updateHuntItemService, removeFromHunt as removeFromHuntService } from '../../services/huntItemService';
import { getEvent, updateStartingBalance as updateStartingBalanceService, updateCurrentBalance as updateCurrentBalanceService } from '../../services/eventService';

// Import the HuntListItem component
import HuntListItem from './HuntListItem.vue';
import type { HuntItem } from '../../types/hunt';

// Debug flag
const DEBUG = true;

// Props
const props = defineProps<{
  eventId: string;
  userId: string;
}>();

// State
const loading = ref(true);
const huntList = ref<any[]>([]);
const startingBalance = ref(0);
const currentBalance = ref<number | null>(null);

// Logging function
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[HuntList]', ...args);
  }
};

// Get the base path for navigation
const basePath = computed(() => import.meta.env.BASE_URL || '/');

// Fetch the hunt list for the current event
const fetchHuntList = async () => {
  try {
    log('Fetching hunt list for event:', props.eventId);
    loading.value = true;
    
    // Fetch event details using the service
    const { event, error: eventError } = await getEvent(props.eventId);
    
    if (eventError) {
      console.error('Error fetching event details:', eventError);
      showError(`Failed to load event details: ${eventError.message}`);
    } else if (event) {
      log('Event details fetched:', event.id);
      
      // We still need to fetch balance information separately
      // as it's stored in suggestion_events table
      const supabase = getSupabaseClient();
      const { data: balanceData, error: balanceError } = await supabase
        .from('suggestion_events')
        .select('starting_balance, current_balance')
        .eq('id', props.eventId)
        .single();
        
      if (balanceError) {
        console.error('Error fetching balance information:', balanceError);
      } else if (balanceData) {
        startingBalance.value = balanceData.starting_balance || 0;
        currentBalance.value = balanceData.current_balance || null;
        log('Starting balance:', startingBalance.value);
        log('Current balance:', currentBalance.value);
      }
    }
    
    // Use the service to fetch hunt items
    const result = await fetchHuntListService(props.eventId);
    const { huntItems, error } = result;

    if (error) {
      console.error('Error fetching hunt items:', error);
      showError(`Failed to load hunt list: ${error.message}`);
      return;
    }

    huntList.value = huntItems;
    
    log('Hunt list fetched:', huntList.value.length);
    
    if (huntList.value.length === 0) {
      showInfo('Hunt list is empty. Add items from the Suggestions page.');
    }
  } catch (e) {
    console.error('Exception during hunt list fetching:', e);
    showError(`Failed to load hunt list: ${e instanceof Error ? e.message : 'Unknown error'}`);
  } finally {
    loading.value = false;
  }
};

// Update a hunt item
const updateHuntItem = async (item: any) => {
  try {
    // Log full item details to debug the ID issue
    console.log('Full hunt item being updated:', JSON.stringify(item, null, 2));
    log('Updating hunt item with ID:', item.id);
    log('Suggestion ID:', item.suggestion_id);
    
    // Check if we're using the correct ID
    if (!item.id.includes('-')) {
      console.error('Invalid hunt item ID format. Expected UUID format but got:', item.id);
      showError('Invalid hunt item ID format. Please refresh the page and try again.');
      return;
    }
    
    // Create a complete hunt item object for the service
    const huntItemToUpdate: HuntItem = {
      id: item.id, // This should be the hunt_items table ID, not the suggestion ID
      event_id: item.event_id,
      suggestion_id: item.suggestion_id,
      wager: item.wager,
      result: item.result,
      bonus: item.bonus,
      super_bonus: item.super_bonus,
      completed: item.completed,
      custom_thumb: item.custom_thumb,
      url_background: item.url_background,
      item: item.item,
      active: item.active
    };
    
    // Log the object we're sending to the service
    console.log('Hunt item object being sent to service:', huntItemToUpdate);
    
    // Use the service to update the item
    const { huntItem, error } = await updateHuntItemService(huntItemToUpdate);

    if (error) {
      console.error('Error updating hunt item:', error);
      showError(`Failed to update hunt item: ${error.message}`);
      return;
    }
    
    if (!huntItem) {
      console.error('Failed to update hunt item');
      showError('Failed to update hunt item: Unknown error');
      return;
    }
    
    log('Hunt item updated:', item.id);
    showSuccess('Hunt item updated successfully');
  } catch (e) {
    console.error('Exception during hunt item update:', e);
    showError(`Failed to update hunt item: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

// Remove a hunt item
const removeHuntItem = async (itemId: string) => {
  if (!itemId) {
    console.error('Invalid item ID for removal');
    showError('Cannot remove item: Invalid ID');
    return;
  }

  try {
    log('Removing hunt item with ID:', itemId);
    
    // Get the item name for the toast message
    const itemName = huntList.value.find(item => item.id === itemId)?.item || 'Item';
    showInfo(`Removing "${formatItemName(itemName)}" from hunt list...`);
    
    // First update local state for immediate UI feedback (optimistic update)
    const originalList = [...huntList.value];
    huntList.value = huntList.value.filter(item => item.id !== itemId);
    
    // Use the service to remove the item
    const { success, error, data } = await removeFromHuntService(itemId);

    if (error) {
      console.error('Error removing hunt item:', error);
      // If there was an error, restore the original list
      huntList.value = originalList;
      showError(`Failed to remove item: ${error.message}`);
      return;
    }
    
    if (!success) {
      console.error('Failed to remove hunt item');
      // If there was an error, restore the original list
      huntList.value = originalList;
      showError('Failed to remove item: Unknown error');
      return;
    }
    
    log('Hunt item removed successfully:', data);
    showSuccess(`"${formatItemName(itemName)}" removed from hunt list!`);
  } catch (e) {
    console.error('Exception during hunt item removal:', e);
    // Refetch the list to ensure UI is in sync with the database
    showError(`An error occurred while removing the item: ${e instanceof Error ? e.message : 'Unknown error'}`);
    await fetchHuntList();
  }
};

// Update starting balance for the event
const updateStartingBalance = async () => {
  try {
    log('Updating starting balance for event:', props.eventId);
    
    // Use the service function to update the starting balance
    const { success, error } = await updateStartingBalanceService(props.eventId, startingBalance.value);
      
    if (error) {
      console.error('Error updating starting balance:', error);
      showError(`Failed to update starting balance: ${error.message}`);
      return;
    }
    
    if (!success) {
      console.error('Failed to update starting balance');
      showError('Failed to update starting balance: Unknown error');
      return;
    }
    
    log('Starting balance updated for event:', props.eventId);
    showSuccess('Starting balance updated successfully');
  } catch (e) {
    console.error('Exception during starting balance update:', e);
    showError(`Failed to update starting balance: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

// Update current balance for the event
const updateCurrentBalance = async () => {
  try {
    log('Updating current balance for event:', props.eventId);
    
    // Use the service function to update the current balance
    const { success, error } = await updateCurrentBalanceService(props.eventId, currentBalance.value);
      
    if (error) {
      console.error('Error updating current balance:', error);
      showError(`Failed to update current balance: ${error.message}`);
      return;
    }
    
    if (!success) {
      console.error('Failed to update current balance');
      showError('Failed to update current balance: Unknown error');
      return;
    }
    
    log('Current balance updated for event:', props.eventId);
    showSuccess('Current balance updated successfully');
  } catch (e) {
    console.error('Exception during current balance update:', e);
    showError(`Failed to update current balance: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

// Calculate total wager
const calculateTotalWager = () => {
  return huntList.value.reduce((total, item) => {
    return total + (item.wager || 0);
  }, 0);
};

// Calculate total result
const calculateTotalResult = () => {
  return huntList.value.reduce((total, item) => {
    return total + (item.result || 0);
  }, 0);
};

// Calculate profit/loss
const calculateProfit = () => {
  return calculateTotalResult() - calculateTotalWager();
};

// Helper function to get placeholder image
const getPlaceholderImage = (itemName: string) => {
  // Generate a placeholder based on the item name
  return `https://placehold.co/100x100/orange/white?text=${encodeURIComponent(itemName.substring(0, 2).toUpperCase())}`;
};

// Helper function to handle image loading errors
const handleImageError = (event: Event, item: any) => {
  const target = event.target as HTMLImageElement;
  target.src = getPlaceholderImage(item.item);
};

// Lifecycle hooks
onMounted(async () => {
  log('Component mounted');
  await fetchHuntList();
});
</script>
