<template>
  <div class="space-y-3">
    <div class="bg-brown rounded-lg shadow p-3">
      
      <!-- Search input -->
      <div class="mb-2">
        <div class="relative">
          <input
            style="background-color: #592101"
            v-model="searchTerm"
            @input="handleSearchInput"
            type="text"
            placeholder="Search for games..."
            class="w-full px-3 py-1.5 text-sm border rounded-md pr-8"
          />
          <button 
            @click="resetAndFetchGames"
            class="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gold hover:text-gray-700 bg-orange p-1 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-center my-4">
        <div class="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Games list -->
      <div v-else-if="!loading && games.length > 0" class="space-y-1">
        <div
          v-for="game in games"
          :key="game._id || game.game_id"
          class="flex items-center p-2 border rounded hover:bg-orange-900/40 cursor-pointer transition-all duration-200"
          @click="suggestItem(game.name)"
        >
          <!-- Game thumbnail -->
          <div class="relative w-12 h-12 mr-3 overflow-hidden rounded flex-shrink-0">
            <img 
              :src="game.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/') || game.url_thumb" 
              :alt="game.name" 
              class="w-full h-full object-cover"
              @error="handleImageError($event, game)"
            />
          </div>
          
          <!-- Game details -->
          <div class="flex-grow min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gold text-sm truncate">{{ formatGameName(game.name) }}</span>
              <span v-if="game.rtp" class="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded ml-2 flex-shrink-0">{{ game.rtp }}%</span>
            </div>
            
            <div class="text-gold text-xs opacity-75">{{ game.provider }}</div>
            
            <!-- Features tags -->
            <div v-if="game.features && game.features.length" class="flex flex-wrap gap-1 mt-1">
              <span 
                v-for="feature in game.features.slice(0, 3)" 
                :key="feature" 
                class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded"
              >
                {{ formatFeature(feature) }}
              </span>
              <span v-if="game.features.length > 3" class="text-xs text-gold opacity-50">+{{ game.features.length - 3 }}</span>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-col gap-1 ml-2">
            <button
              @click.stop="addToHuntList(game)"
              :disabled="huntItems.includes(game.name)"
              class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :title="huntItems.includes(game.name) ? 'Already in hunt list' : 'Add to hunt list'"
            >
              {{ huntItems.includes(game.name) ? '✓ Hunt' : '+ Hunt' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- No results message -->
      <div v-else-if="!loading && games.length === 0 && searchTerm.trim() !== ''" class="text-center py-4">
        <p class="text-gold text-sm">No games found. Try a different search term.</p>
      </div>
      
      <!-- Pagination controls -->
      <div class="mt-3 flex justify-between items-center text-sm">
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

    <div class="rounded-lg shadow p-3">
      <h2 class="text-lg font-semibold mb-2 text-orange">Your Suggestions</h2>
      <div class="space-y-1">
        <div
          v-for="item in suggestedItems"
          :key="item"
          class="flex items-center justify-between p-2 border rounded hover:bg-orange text-sm"
        >
          <span class="truncate">{{ formatGameName(item) }}</span>
          <span class="text-green-600 text-xs ml-2 flex-shrink-0">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { addSuggestion } from '../../services/suggestionService';
import { addGameToHunt } from '../../services/huntItemService';
import { showSuccess, showError, showInfo, showWarning } from '../../lib/toast';
import 'vue3-toastify/dist/index.css';
import '../../styles/toast.css';

// Props interface
interface Props {
  eventId: string;
  userId: string;
}

// Props
const props = defineProps<Props>();

// State
const games = ref<any[]>([]);
const suggestedItems = ref<string[]>([]);
const huntItems = ref<string[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(36);
const searchTerm = ref('');
const searchTimeout = ref<number | null>(null);
const hasPrevPage = ref(false);
const hasNextPage = ref(false);

// Format game name to be more readable
const formatGameName = (name: string) => {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format feature name to be more readable
const formatFeature = (feature: string) => {
  if (!feature) return '';
  return feature
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Handle image loading errors
const handleImageError = (event: Event, game: any) => {
  const target = event.target as HTMLImageElement;
  // Try fallback image if available
  if (target.src !== game.custom_thumb && game.custom_thumb) {
    target.src = game.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/');
  } else {
    // Use a placeholder if both images fail
    target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatGameName(game.name))}`;
  }
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
    loading.value = false;
    return;
  }
  
  loading.value = true;
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
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    
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
    loading.value = false;
  }
};

// Reset pagination and fetch games
const resetAndFetchGames = () => {
  console.log('Resetting pagination and fetching games');
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

// Suggest an item
const suggestItem = async (item: string) => {
  if (suggestedItems.value.includes(item)) {
    // Silently ignore - visual feedback is enough (checkmark in list)
    return;
  }
  
  // Find the game data for the selected item
  const selectedGame = games.value.find(game => game.name === item);
  
  try {
    console.log('Suggesting item with game data:', selectedGame);
    
    // Use the addSuggestion service which will automatically handle event selection
    const { suggestion, error } = await addSuggestion(
      props.eventId, // This can be null/invalid, service will handle it
      item,
      props.userId,
      selectedGame?.custom_thumb || selectedGame?.url_thumb || null,
      selectedGame?.url_background || null
    );
    
    if (error) {
      console.error('Error suggesting item:', error);
      // Only show error toasts for actual failures
      showError(`Failed to suggest "${formatGameName(item)}": ${error.message}`);
      return;
    }
    
    suggestedItems.value.push(item);
    // Removed success toast - visual feedback (checkmark) is sufficient
    console.log('Item suggested successfully with images:', {
      custom_thumb: selectedGame?.custom_thumb || selectedGame?.url_thumb,
      url_background: selectedGame?.url_background,
      suggestion
    });
  } catch (error) {
    console.error('Error suggesting item:', error);
    showError(`Failed to suggest "${formatGameName(item)}". Please try again.`);
  }
};

// Add game to hunt list
const addToHuntList = async (game: any) => {
  if (huntItems.value.includes(game.name)) {
    // Already in hunt list, ignore
    return;
  }
  
  try {
    console.log('Adding game to hunt list:', game);
    
    // Use the addGameToHunt service which handles both suggestion and hunt list addition
    const { huntItem, error, exists } = await addGameToHunt(
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
    
    // Update local state
    huntItems.value.push(game.name);
    if (!suggestedItems.value.includes(game.name)) {
      suggestedItems.value.push(game.name);
    }
    
    showSuccess(`"${formatGameName(game.name)}" added to hunt list!`);
    console.log('Game added to hunt list successfully:', huntItem);
  } catch (error) {
    console.error('Error adding to hunt list:', error);
    showError(`Failed to add "${formatGameName(game.name)}" to hunt list. Please try again.`);
  }
};

// Fetch hunt items
const fetchHuntItems = async () => {
  const supabase = getSupabaseClient();
  
  try {
    // Get hunt items for this event
    const { data: huntItemsData, error: huntError } = await supabase
      .from('hunt_items')
      .select('suggestion_id')
      .eq('event_id', props.eventId);
    
    if (huntError) throw huntError;
    
    if (huntItemsData && huntItemsData.length > 0) {
      // Get the suggestion names for these hunt items
      const suggestionIds = huntItemsData.map(item => item.suggestion_id);
      
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('item')
        .in('id', suggestionIds);
        
      if (suggestionsError) throw suggestionsError;
      
      huntItems.value = suggestionsData?.map(suggestion => suggestion.item) || [];
    } else {
      huntItems.value = [];
    }
  } catch (error) {
    console.error('Error fetching hunt items:', error);
    // Don't show error toast for this as it's not critical for the user experience
  }
};

// Fetch suggested items
const fetchSuggestedItems = async () => {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('item')
      .eq('event_id', props.eventId)
      .eq('user_id', props.userId);
    
    if (error) throw error;
    
    suggestedItems.value = data?.map(suggestion => suggestion.item) || [];
  } catch (error) {
    console.error('Error fetching suggested items:', error);
    // Only show error if it's a critical failure that affects functionality
    // Most users won't need to see this unless it's persistent
  }
};

// Cleanup function for subscriptions
const cleanupSubscriptions = (channel) => {
  if (channel) {
    console.log('Cleaning up real-time subscriptions');
    channel.unsubscribe();
  }
};

// Lifecycle hooks
let suggestionsChannel;

onMounted(() => {
  console.log('Component mounted, calling fetchGames...');
  fetchGames();
  console.log('Called fetchGames, now calling fetchSuggestedItems...');
  fetchSuggestedItems();
  console.log('Called fetchSuggestedItems, now calling fetchHuntItems...');
  fetchHuntItems();
  
  console.log('Component initialization complete');
  
  // No longer need the duplicate fetch
});

onUnmounted(() => {
  console.log('Component unmounting, cleaning up subscriptions');
  cleanupSubscriptions(suggestionsChannel);
});
</script>
