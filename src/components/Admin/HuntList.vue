<template>
  <div class="flex gap-6">
    <!-- Main Content -->
    <div class="flex-1 space-y-6">
      <div class="bg-brown rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gold">Hunt List</h2>
        <button
          @click="openStreamWindow"
          class="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-md transition-colors"
          title="Open Stream Element in New Window"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Stream Element
        </button>
      </div>
      
      <!-- Game Search Section -->
      <div class="mb-6 p-4 bg-brown-dark rounded-lg border border-orange">
        <h3 class="text-lg font-semibold mb-3 text-gold">Add Games to Hunt</h3>
        
        <!-- Search input -->
        <div class="mb-3">
          <div class="relative">
            <input
              style="background-color: #592101"
              v-model="searchTerm"
              @input="handleSearchInput"
              type="text"
              placeholder="Search for games to add to hunt list..."
              class="w-full px-3 py-2 text-sm border rounded-md pr-10 text-gold"
            />
            <button 
              @click="resetAndFetchGames"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gold hover:text-gray-700 bg-orange p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Loading indicator for games -->
        <div v-if="gamesLoading" class="flex justify-center my-4">
          <div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <!-- Games list -->
        <div v-else-if="!gamesLoading && games.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="game in games"
            :key="game._id || game.game_id"
            class="flex items-center p-2 border rounded hover:bg-orange-900/40 transition-all duration-200"
          >
            <!-- Game thumbnail -->
            <div class="relative w-10 h-10 mr-3 overflow-hidden rounded flex-shrink-0">
              <img 
                :src="game.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/') || game.url_thumb" 
                :alt="game.name" 
                class="w-full h-full object-cover"
                @error="handleGameImageError($event, game)"
              />
            </div>
            
            <!-- Game details -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gold text-sm truncate">{{ formatGameName(game.name) }}</span>
                <span v-if="game.rtp" class="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded ml-2 flex-shrink-0">{{ game.rtp }}%</span>
              </div>
              <div class="text-gold text-xs opacity-75">{{ game.provider }}</div>
            </div>
            
            <!-- Add to hunt button -->
            <button
              @click="addGameToHunt(game)"
              :disabled="isGameInHuntList(game.name)"
              class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"
              :title="isGameInHuntList(game.name) ? 'Already in hunt list' : 'Add to hunt list'"
            >
              {{ isGameInHuntList(game.name) ? '✓ Added' : '+ Add to Hunt' }}
            </button>
          </div>
        </div>
        
        <!-- No results message -->
        <div v-else-if="!gamesLoading && games.length === 0 && searchTerm.trim() !== ''" class="text-center py-4">
          <p class="text-gold text-sm">No games found. Try a different search term.</p>
        </div>
        
        <!-- Pagination controls -->
        <div v-if="games.length > 0" class="mt-3 flex justify-between items-center text-sm">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1 || !hasPrevPage"
            class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span class="text-gold">Page {{ currentPage }}</span>
          
          <button 
            @click="nextPage" 
            :disabled="!hasNextPage"
            class="px-3 py-1.5 border rounded bg-orange text-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      </div>
      
      <!-- Summary header -->
      <div v-if="!loading" class="mb-3">
        <div class="flex flex-wrap items-center gap-3 px-3 py-2 bg-brown-dark rounded border border-orange">
          <div class="text-xs text-gold/80">Starting</div>
          <div class="text-sm font-semibold text-gold">{{ formattedStartingBalance }}</div>
          <span class="mx-2 h-4 w-px bg-orange/40"></span>
          <div class="text-xs text-gold/80">Items</div>
          <div class="text-sm font-semibold text-gold">{{ totalItemsCount }}</div>
          <span class="mx-2 h-4 w-px bg-orange/40"></span>
          <div class="text-xs text-gold/80">Bonuses</div>
          <div class="text-sm font-semibold text-violet-300">{{ totalBonusCount }}</div>
          <span class="mx-2 h-4 w-px bg-orange/40"></span>
          <div class="text-xs text-gold/80">Super</div>
          <div class="text-sm font-semibold text-amber-300">{{ totalSuperBonusCount }}</div>
        </div>
      </div>
      
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
      </div>

      </div>
      <!-- Summary section -->
    <!-- <div v-if="huntList.length > 0" class="mt-8 p-4 border rounded-lg bg-brown border-orange">
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
        <div class="flex-1 flex items-center gap-2">
          <label class="text-sm text-gold">Current Balance:</label>
          <input
            type="number"
            v-model="currentBalance"
            class="w-32 px-2 py-1 border rounded bg-brown-dark text-gold"
            @input="updateCurrentBalance"
            placeholder="Enter current balance"
          />
        </div>
      </div>
      </div> -->
    </div>
    
    <!-- Suggestions Sidebar -->
    <div class="w-80 space-y-3">
      <div class="bg-brown rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gold">Suggestions</h3>
          <span class="text-sm text-orange bg-brown-dark px-2 py-1 rounded">{{ suggestions.length }}</span>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="suggestionsLoading" class="flex justify-center my-4">
          <div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <!-- Suggestions list -->
        <div v-else-if="suggestions.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="flex items-center p-2 border rounded hover:bg-orange-900/40 transition-all duration-200"
          >
            <!-- Game thumbnail -->
            <div class="relative w-8 h-8 mr-2 overflow-hidden rounded flex-shrink-0">
              <img 
                :src="suggestion.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/') || suggestion.url_thumb || '/placeholder-game.png'" 
                :alt="suggestion.item" 
                class="w-full h-full object-cover"
                @error="handleSuggestionImageError($event)"
              />
            </div>
            
            <!-- Suggestion details -->
            <div class="flex-grow min-w-0 mr-2">
              <div class="font-medium text-gold text-sm truncate">{{ formatGameName(suggestion.item) }}</div>
              <div class="text-xs text-orange">{{ suggestion.count }} suggestion{{ suggestion.count > 1 ? 's' : '' }}</div>
            </div>
            
            <!-- Add to hunt button -->
            <button
              @click="addSuggestionToHunt(suggestion)"
              :disabled="isGameInHuntList(suggestion.item)"
              class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              :title="isGameInHuntList(suggestion.item) ? 'Already in hunt list' : 'Add to hunt list'"
            >
              {{ isGameInHuntList(suggestion.item) ? '✓' : '+' }}
            </button>
          </div>
        </div>
        
        <!-- No suggestions message -->
        <div v-else class="text-center py-4">
          <p class="text-gold text-sm">No suggestions yet.</p>
          <p class="text-gold text-xs opacity-75 mt-1">Users can add suggestions from the main page.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { formatItemName } from '../../lib/utils';
import { showSuccess, showError, showInfo } from '../../lib/toast';
import { fetchHuntList as fetchHuntListService, updateHuntItem as updateHuntItemService, removeFromHunt as removeFromHuntService, addGameToHunt as addGameToHuntService } from '../../services/huntItemService';
import { getEvent, updateStartingBalance as updateStartingBalanceService, updateCurrentBalance as updateCurrentBalanceService } from '../../services/eventService';
import { fetchSuggestions } from '../../services/suggestionService';
import 'vue3-toastify/dist/index.css';
import '../../styles/toast.css';
import HuntListItem from './HuntListItem.vue';
import type { HuntItem } from '../../types/hunt';
import type { Suggestion } from '../../types/suggestion';

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

// Game search state
const games = ref<any[]>([]);
const gamesLoading = ref(false);
const searchTerm = ref('');
const searchTimeout = ref<number | null>(null);
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(20);

// Summary computed values
const totalItemsCount = computed(() => huntList.value.length);
const totalBonusCount = computed(() => huntList.value.filter(i => i.bonus === true).length);
const totalSuperBonusCount = computed(() => huntList.value.filter(i => i.super_bonus === true).length);
const formattedStartingBalance = computed(() => {
  const n = startingBalance.value ?? 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString('en-US')}`;
  }
});
const hasPrevPage = ref(false);
const hasNextPage = ref(false);

// Suggestions state
const suggestions = ref<Suggestion[]>([]);
const suggestionsLoading = ref(false);

// Logging function
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[HuntList]', ...args);
  }
};

// Get the base path for navigation
const basePath = computed(() => import.meta.env.BASE_URL || '/');

// Open stream element in new window
const openStreamWindow = () => {
  console.log(`${window.location.origin}${basePath.value}stream/${props.eventId}`);
  const streamUrl = `${window.location.origin}${basePath.value}stream/${props.eventId}`;
  const windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no';
  
  const streamWindow = window.open(streamUrl, 'huntStreamElement', windowFeatures);
  
  if (streamWindow) {
    streamWindow.focus();
    showSuccess('Stream element opened in new window');
  } else {
    showError('Failed to open stream window. Please check your popup blocker settings.');
  }
};

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
    
    // Update local list so computed summary updates immediately
    const idx = huntList.value.findIndex((i) => i.id === huntItem.id);
    if (idx !== -1) {
      // Merge to preserve any local-only fields
      huntList.value[idx] = { ...huntList.value[idx], ...huntItem } as any;
    } else {
      // If the item wasn't found (edge case), refetch the list
      await fetchHuntList();
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

// Game search functions
// Format game name to be more readable
const formatGameName = (name: string) => {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Handle game image loading errors
const handleGameImageError = (event: Event, game: any) => {
  const target = event.target as HTMLImageElement;
  // Try fallback image if available
  if (target.src !== game.custom_thumb && game.custom_thumb) {
    target.src = game.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/');
  } else {
    // Use a placeholder if both images fail
    target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatGameName(game.name))}`;
  }
};

// Check if game is already in hunt list
const isGameInHuntList = (gameName: string) => {
  return huntList.value.some(item => item.item === gameName);
};

// Handle search input with debounce
const handleSearchInput = () => {
  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Set a new timeout to delay the search
  searchTimeout.value = setTimeout(() => {
    resetAndFetchGames();
    showInfo('Searching for games...');
  }, 500) as unknown as number;
};

// Fetch games from the API
const fetchGames = async () => {
  // Don't make a request if search term is empty
  if (!searchTerm.value.trim()) {
    games.value = [];
    totalItems.value = 0;
    gamesLoading.value = false;
    return;
  }
  
  gamesLoading.value = true;
  console.log('Fetching games with params:', {
    search: searchTerm.value,
    page: currentPage.value,
    perPage: itemsPerPage.value
  });
  
  try {
    // Use our server-side API endpoint to avoid CORS issues
    const apiUrl = '/bognushunter/api/games';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        search: searchTerm.value,
        page: currentPage.value,
        perPage: itemsPerPage.value
      }),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update state with the fetched data
    games.value = data.results || [];
    totalItems.value = data.pagination?.totalEntries || 0;
    hasPrevPage.value = data.pagination?.hasPrev || false;
    hasNextPage.value = data.pagination?.hasNext || false;
  } catch (error) {
    console.error('Error fetching games:', error);
    showError('Failed to load games. Please try again.');
    games.value = [];
    totalItems.value = 0;
    hasPrevPage.value = false;
    hasNextPage.value = false;
  } finally {
    gamesLoading.value = false;
  }
};

// Reset pagination and fetch games
const resetAndFetchGames = () => {
  currentPage.value = 1;
  fetchGames();
};

// Pagination methods
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    fetchGames();
  }
};

const prevPage = () => {
  if (hasPrevPage.value && currentPage.value > 1) {
    currentPage.value--;
    fetchGames();
  }
};

// Add game to hunt list
const addGameToHunt = async (game: any) => {
  if (isGameInHuntList(game.name)) {
    showInfo(`"${formatGameName(game.name)}" is already in the hunt list`);
    return;
  }
  
  try {
    console.log('Adding game to hunt list:', game);
    
    // Use the addGameToHunt service which handles both suggestion and hunt list addition
    const { huntItem, error, exists } = await addGameToHuntService(
      props.eventId,
      game.name,
      props.userId,
      game.custom_thumb || game.url_thumb || null,
      game.url_background || null
    );
    
    if (error) {
      console.error('Error adding to hunt list:', error);
      showError(`Failed to add "${formatGameName(game.name)}" to hunt list: ${error.message}`);
      return;
    }
    
    if (exists) {
      showInfo(`"${formatGameName(game.name)}" is already in the hunt list`);
      return;
    }
    
    // Refresh the hunt list to show the new item
    await fetchHuntList();
    
    showSuccess(`"${formatGameName(game.name)}" added to hunt list!`);
    console.log('Game added to hunt list successfully:', huntItem);
  } catch (error) {
    console.error('Error adding to hunt list:', error);
    showError(`Failed to add "${formatGameName(game.name)}" to hunt list. Please try again.`);
  }
};

// Fetch suggestions for the sidebar
const fetchSuggestionsData = async () => {
  try {
    suggestionsLoading.value = true;
    log('Fetching suggestions for event:', props.eventId);
    
    const { suggestions: fetchedSuggestions, error } = await fetchSuggestions(props.eventId);
    
    if (error) {
      console.error('Error fetching suggestions:', error);
      showError(`Failed to load suggestions: ${error.message}`);
      return;
    }
    
    suggestions.value = fetchedSuggestions;
    log('Suggestions fetched:', suggestions.value.length);
  } catch (e) {
    console.error('Exception during suggestions fetching:', e);
    showError(`Failed to load suggestions: ${e instanceof Error ? e.message : 'Unknown error'}`);
  } finally {
    suggestionsLoading.value = false;
  }
};

// Handle suggestion image loading errors
const handleSuggestionImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-game.png';
};

// Add suggestion to hunt list
const addSuggestionToHunt = async (suggestion: Suggestion) => {
  if (isGameInHuntList(suggestion.item)) {
    showInfo(`"${formatGameName(suggestion.item)}" is already in the hunt list`);
    return;
  }
  
  try {
    console.log('Adding suggestion to hunt list:', suggestion);
    
    // Use the addGameToHunt service which handles both suggestion and hunt list addition
    const { huntItem, error, exists } = await addGameToHuntService(
      props.eventId,
      suggestion.item,
      props.userId,
      suggestion.custom_thumb || suggestion.url_thumb || null,
      suggestion.url_background || null
    );
    
    if (error) {
      console.error('Error adding suggestion to hunt list:', error);
      showError(`Failed to add "${formatGameName(suggestion.item)}" to hunt list: ${error.message}`);
      return;
    }
    
    if (exists) {
      showInfo(`"${formatGameName(suggestion.item)}" is already in the hunt list`);
      return;
    }
    
    // Refresh the hunt list to show the new item
    await fetchHuntList();
    
    showSuccess(`"${formatGameName(suggestion.item)}" added to hunt list!`);
    console.log('Suggestion added to hunt list successfully:', huntItem);
  } catch (error) {
    console.error('Error adding suggestion to hunt list:', error);
    showError(`Failed to add "${formatGameName(suggestion.item)}" to hunt list. Please try again.`);
  }
};

// Setup real-time subscription for suggestions
const setupSuggestionsSubscription = () => {
  const supabase = getSupabaseClient();
  
  log('Setting up real-time subscription for suggestions');
  
  const suggestionsChannel = supabase
    .channel('suggestions-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'suggestions',
        filter: `event_id=eq.${props.eventId}`
      },
      (payload) => {
        log('Suggestions change detected:', payload);
        
        // Debounce the refetch to avoid too many rapid updates
        if (suggestionsRefreshTimeout.value) {
          clearTimeout(suggestionsRefreshTimeout.value);
        }
        
        suggestionsRefreshTimeout.value = setTimeout(() => {
          log('Refreshing suggestions due to real-time update');
          fetchSuggestionsData();
        }, 500) as unknown as number;
      }
    )
    .subscribe((status) => {
      log('Suggestions subscription status:', status);
    });
    
  return suggestionsChannel;
};

// Cleanup function for subscriptions
const cleanupSubscriptions = (channel: any) => {
  if (channel) {
    log('Cleaning up suggestions subscription');
    channel.unsubscribe();
  }
};

// Lifecycle hooks
let suggestionsChannel: any;
const suggestionsRefreshTimeout = ref<number | null>(null);

onMounted(async () => {
  log('Component mounted');
  await fetchHuntList();
  await fetchSuggestionsData();
  
  // Setup real-time subscription
  suggestionsChannel = setupSuggestionsSubscription();
});

// Cleanup on unmount
import { onUnmounted } from 'vue';

onUnmounted(() => {
  log('Component unmounting, cleaning up subscriptions');
  cleanupSubscriptions(suggestionsChannel);
  
  // Clear any pending timeouts
  if (suggestionsRefreshTimeout.value) {
    clearTimeout(suggestionsRefreshTimeout.value);
  }
});
</script>
