<template>
  <div class="space-y-6">
    <div class="bg-brown rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 text-gold">Hunt List</h2>
      
      <div v-if="loading" class="flex justify-center my-8">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="huntList.length > 0" class="space-y-4">
        <div
          v-for="huntItem in huntList"
          :key="huntItem.id"
          class="p-3 border rounded-lg hover:bg-orange-900/40"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Game thumbnail with background -->
              <div class="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                <!-- Background image if available -->
                <div v-if="huntItem.url_background" class="absolute inset-0 z-0">
                  <img 
                    :src="huntItem.url_background?.replace('cdn://', 'https://cdnv1.500.casino/')" 
                    :alt="`${huntItem.item} background`" 
                    class="w-full h-full object-cover opacity-30"
                  />
                </div>
                
                <!-- Main thumbnail -->
                <img 
                  v-if="huntItem.custom_thumb" 
                  :src="huntItem.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/') || getPlaceholderImage(huntItem.item)" 
                  :alt="huntItem.item" 
                  class="w-full h-full object-cover relative z-10"
                  @error="handleImageError($event, huntItem)"
                />
                <div v-else class="w-full h-full bg-orange flex items-center justify-center relative z-10">
                  <span class="text-xs text-gold">{{ formatItemName(huntItem.item).substring(0, 2).toUpperCase() }}</span>
                </div>
                </div>
              </div>
              <span class="font-medium">{{ formatItemName(huntItem.item) }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gold">Wager:</label>
                <input
                  type="number"
                  v-model="huntItem.wager"
                  class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold"
                  @input="updateHuntItem(huntItem)"
                />
              </div>
              
              <div class="flex items-center gap-2">
                <label class="text-sm text-gold">Result:</label>
                <input
                  type="number"
                  v-model="huntItem.result"
                  class="w-24 px-2 py-1 border rounded bg-brown-dark text-gold"
                  @input="updateHuntItem(huntItem)"
                />
              </div>
              
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="huntItem.bonus"
                  class="w-4 h-4"
                  @change="updateHuntItem(huntItem)"
                />
                <label class="text-sm text-gold">Bonus</label>
              </div>
              
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="huntItem.super_bonus"
                  class="w-4 h-4"
                  @change="updateHuntItem(huntItem)"
                />
                <label class="text-sm text-gold">Super Bonus</label>
              </div>
              
              <button
                @click.stop.prevent="removeHuntItem(huntItem.id)"
                class="px-3 py-1 bg-orange-500 text-gold text-sm rounded hover:bg-orange-600"
              >
                Remove
              </button>
            </div>
          </div>
          
          <!-- Completion status -->
          <!-- <div class="mt-2 flex items-center">
            <div class="flex items-center gap-2 mr-4">
              <input
                type="checkbox"
                v-model="huntItem.completed"
                class="w-4 h-4"
                @change="updateHuntItem(huntItem)"
              />
              <label class="text-sm text-gold">Mark as Completed</label>
            </div>
            
            <span 
              :class="[
                'px-2 py-1 text-xs rounded-full', 
                huntItem.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              ]"
            >
              {{ huntItem.completed ? 'Completed' : 'Pending' }}
            </span>
          </div> -->
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gold">No items in the hunt list yet.</p>
          <p class="text-gold mt-2">
            Add items from the <a :href="`${basePath}suggestions/${props.eventId}`" class="text-blue-500 underline">Suggestions page</a>.
          </p>
        </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getSupabaseClient, supabase } from '../../lib/supabase';
import { formatItemName } from '../../lib/utils';

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

// Fetch hunt list for the selected event
const fetchHuntList = async () => {
  try {
    log('Fetching hunt list for event:', props.eventId);
    loading.value = true;
    
    // First fetch event details to get starting balance and current balance
    const { data: eventData, error: eventError } = await supabase
      .from('suggestion_events')
      .select('starting_balance, current_balance')
      .eq('id', props.eventId)
      .single();
      
    if (eventError) {
      console.error('Error fetching event details:', eventError);
    } else if (eventData) {
      startingBalance.value = eventData.starting_balance || 0;
      currentBalance.value = eventData.current_balance || null;
      log('Starting balance:', startingBalance.value);
      log('Current balance:', currentBalance.value);
    }
    
    // First fetch hunt items without joins to avoid GROUP BY errors
    const { data: huntItemsData, error: huntItemsError } = await supabase
      .from('hunt_items')
      .select('*')
      .eq('event_id', props.eventId)
      .order('id');

    if (huntItemsError) {
      console.error('Error fetching hunt items:', huntItemsError);
      loading.value = false;
      return;
    }
    
    if (huntItemsData && huntItemsData.length > 0) {
      // Get all suggestion IDs from hunt items
      const suggestionIds = huntItemsData.map(item => item.suggestion_id);
      
      // Then fetch the related suggestions separately
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('id, item, custom_thumb, url_background')
        .in('id', suggestionIds);
        
      if (suggestionsError) {
        console.error('Error fetching suggestions for hunt items:', suggestionsError);
        loading.value = false;
        return;
      }
      
      // Create maps for suggestion data
      const suggestionMap = new Map();
      const thumbnailMap = new Map();
      const backgroundMap = new Map();
      
      suggestionsData?.forEach(suggestion => {
        suggestionMap.set(suggestion.id, suggestion.item);
        if (suggestion.custom_thumb) {
          thumbnailMap.set(suggestion.id, suggestion.custom_thumb);
        }
        if (suggestion.url_background) {
          backgroundMap.set(suggestion.id, suggestion.url_background);
        }
      });
      
      // Join the data manually
      huntList.value = huntItemsData.map(huntItem => ({
        ...huntItem,
        item: suggestionMap.get(huntItem.suggestion_id) || 'Unknown item',
        // Prioritize thumbnails and backgrounds from hunt_items table, fall back to suggestion data
        custom_thumb: huntItem.custom_thumb || thumbnailMap.get(huntItem.suggestion_id) || null,
        url_background: huntItem.url_background || backgroundMap.get(huntItem.suggestion_id) || null
      }));
    } else {
      huntList.value = [];
    }
    
    log('Hunt list fetched:', huntList.value.length);
  } catch (e) {
    console.error('Exception during hunt list fetching:', e);
  } finally {
    loading.value = false;
  }
};

// Update a hunt item
const updateHuntItem = async (item: any) => {
  try {
    log('Updating hunt item:', item.id);
    
    const { error } = await supabase
      .from('hunt_items')
      .update({
        wager: item.wager,
        result: item.result,
        bonus: item.bonus,
        super_bonus: item.super_bonus,
        completed: item.completed
      })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating hunt item:', error);
      return;
    }
    
    log('Hunt item updated:', item.id);
  } catch (e) {
    console.error('Exception during hunt item update:', e);
  }
};

// Remove a hunt item
const removeHuntItem = async (itemId: string) => {
  if (!itemId) {
    console.error('Invalid item ID for removal');
    return;
  }

  try {
    log('Removing hunt item with ID:', itemId);
    
    // First update local state for immediate UI feedback
    const originalList = [...huntList.value];
    huntList.value = huntList.value.filter(item => item.id !== itemId);
    
    // Then perform the database operation with the direct Supabase client
    const { error, data } = await supabase
      .from('hunt_items')
      .delete()
      .eq('id', itemId)
      .select();

    if (error) {
      console.error('Error removing hunt item:', error);
      // If there was an error, restore the original list
      huntList.value = originalList;
      return;
    }
    
    log('Hunt item removed successfully:', data);
  } catch (e) {
    console.error('Exception during hunt item removal:', e);
    // Refetch the list to ensure UI is in sync with the database
    await fetchHuntList();
  }
};

// Update starting balance for the event
const updateStartingBalance = async () => {
  try {
    log('Updating starting balance for event:', props.eventId);
    
    const { error } = await supabase
      .from('suggestion_events')
      .update({
        starting_balance: startingBalance.value
      })
      .eq('id', props.eventId);
      
    if (error) {
      console.error('Error updating starting balance:', error);
      return;
    }
    
    log('Starting balance updated for event:', props.eventId);
  } catch (e) {
    console.error('Exception during starting balance update:', e);
  }
};

// Update current balance for the event
const updateCurrentBalance = async () => {
  try {
    log('Updating current balance for event:', props.eventId);
    
    // Update current_balance directly on the event
    const { error } = await supabase
      .from('suggestion_events')
      .update({
        current_balance: currentBalance.value
      })
      .eq('id', props.eventId);
      
    if (error) {
      console.error('Error updating current balance:', error);
      return;
    }
    
    log('Current balance updated for event:', props.eventId);
  } catch (e) {
    console.error('Exception during current balance update:', e);
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

// Handle image errors
const handleImageError = (event: Event, huntItem: any) => {
  const target = event.target as HTMLImageElement;
  // Use a placeholder if image fails
  target.src = getPlaceholderImage(huntItem.item);
};

// Get placeholder image for a game
const getPlaceholderImage = (gameName: string) => {
  return `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatItemName(gameName))}`;
};

// Lifecycle hooks
onMounted(async () => {
  log('Component mounted');
  await fetchHuntList();
});
</script>
