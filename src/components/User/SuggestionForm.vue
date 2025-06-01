<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Available Games</h2>
      
      <!-- Search input -->
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="searchTerm"
            @input="handleSearchInput"
            type="text"
            placeholder="Search for games..."
            class="w-full px-4 py-2 border rounded-md pr-10"
          />
          <button 
            @click="resetAndFetchGames"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-center my-8">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Games grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="game in games"
          :key="game._id || game.game_id"
          class="flex flex-col p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
          @click="suggestItem(game.name)"
        >
          <!-- Game thumbnail with background -->
          <div class="relative w-full h-40 mb-3 overflow-hidden rounded-md">
            <img 
              :src="game.custom_thumb.replace('cdn://', 'https://cdnv1.500.casino/') || game.url_thumb" 
              :alt="game.name" 
              class="w-full h-full object-cover"
              @error="handleImageError($event, game)"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-2 text-white">
              <span class="font-medium text-sm">{{ formatGameName(game.name) }}</span>
            </div>
          </div>
          
          <!-- Game details -->
          <div class="flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
              <span class="font-medium text-gray-800">{{ formatGameName(game.name) }}</span>
              <span v-if="game.rtp" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">RTP: {{ game.rtp }}%</span>
            </div>
            
            <div class="text-gray-600 text-sm mb-2">{{ game.provider }}</div>
            
            <!-- Features tags -->
            <div v-if="game.features && game.features.length" class="flex flex-wrap gap-1 mt-auto">
              <span 
                v-for="feature in game.features" 
                :key="feature" 
                class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
              >
                {{ formatFeature(feature) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No results message -->
      <div v-if="!loading && games.length === 0" class="text-center py-8">
        <p class="text-gray-500">No games found. Try a different search term.</p>
      </div>
      
      <!-- Pagination controls -->
      <div class="mt-6 flex justify-between items-center">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1 || !hasPrevPage"
          class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span>Page {{ currentPage }}</span>
        
        <button 
          @click="nextPage" 
          :disabled="!hasNextPage"
          class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Your Suggestions</h2>
      <div class="space-y-4">
        <div
          v-for="item in suggestedItems"
          :key="item"
          class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
        >
          <span>{{ formatGameName(item) }}</span>
          <span class="text-green-600">Suggested</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';

// Props
const props = defineProps<{
  eventId: string;
  userId: string;
}>();

// State
const games = ref<any[]>([]);
const suggestedItems = ref<string[]>([]);
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
    target.src = game.custom_thumb.replace('cdn://', 'https://cdnv1.500.casino/');
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
  if (suggestedItems.value.includes(item)) return;
  
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.from('suggestions').insert({
      event_id: props.eventId,
      user_id: props.userId,
      item: item,
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    
    suggestedItems.value.push(item);
  } catch (error) {
    console.error('Error suggesting item:', error);
    alert('Failed to suggest item. Please try again.');
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
  }
};

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted, calling fetchGames...');
  fetchGames();
  console.log('Called fetchGames, now calling fetchSuggestedItems...');
  fetchSuggestedItems();
  console.log('Component initialization complete');
  
  // Force a second fetch after a short delay to ensure it runs
  setTimeout(() => {
    console.log('Forcing second fetchGames call after timeout');
    fetchGames();
  }, 2000);
});
</script>
