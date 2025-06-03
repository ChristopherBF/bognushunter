<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold">Suggestions for Event</h2>
        <p class="text-sm text-gray-600 mt-1">Click on an item to add it to the hunt list</p>
      </div>
      
      <!-- Grid layout for suggestions -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
          :class="{ 'bg-green-100': recentlyAddedSuggestions.includes(suggestion.item) }"
          @click="addToHunt(suggestion)"
        >
          <div class="p-4 flex flex-col items-center text-center">
            <!-- Game thumbnail with background -->
            <div class="relative w-full h-40 mb-3 overflow-hidden rounded-md">
              <img 
                :src="suggestion.custom_thumb?.replace('cdn://', 'https://cdnv1.500.casino/') || suggestion.url_thumb" 
                :alt="suggestion.item" 
                class="w-full h-full object-cover"
                @error="handleImageError($event, suggestion)"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-2 text-white">
                <span class="font-medium text-sm">{{ formatItemName(suggestion.item) }}</span>
              </div>
            </div>
            
            <!-- Item name and count -->
            <div class="flex justify-between items-start w-full">
              <span class="font-medium text-gray-800">{{ formatItemName(suggestion.item) }}</span>
              <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                x{{ suggestion.count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Hunt List</h2>
      <div class="space-y-4">
        <div
          v-for="huntItem in huntList"
          :key="huntItem.id"
          class="p-3 border rounded-lg hover:bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <span>{{ formatItemName(huntItem.item) }}</span>
            <button
              @click="removeFromHunt(huntItem.id)"
              class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { formatItemName } from '../../lib/utils';
import { subscribeSuggestions, subscribeHuntItems, type SuggestionPayload, type HuntItemPayload } from '../../lib/realtime';

// Debug flag
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) console.log('[SuggestionsList]', ...args);
}

log('Component script initialization');

// Props
const props = defineProps<{
  eventId: string;
  userId: string;
}>();

log('Props received:', props);

// Initialize Supabase client
const supabase = getSupabaseClient();

// Reactive state
const suggestions = ref<any[]>([]);
const huntList = ref<any[]>([]);
const recentlyAddedSuggestions = ref<string[]>([]);

// Save custom thumbnail and background URLs to the database
const saveCustomThumb = async (suggestionId: string, thumbUrl: string, backgroundUrl: string | null = null) => {
  try {
    log('Saving custom thumbnail and background for suggestion:', suggestionId);
    
    const updateData: any = { custom_thumb: thumbUrl };
    if (backgroundUrl) {
      updateData.url_background = backgroundUrl;
    }
    
    const { error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', suggestionId);
      
    if (error) {
      console.error('Error saving custom thumbnail and background:', error);
    }
  } catch (e) {
    console.error('Exception saving custom thumbnail and background:', e);
  }
};

// Fetch suggestions for the selected event
const fetchSuggestions = async () => {
  try {
    log('Fetching suggestions for event:', props.eventId);
    
    // First fetch all suggestions for this event
    const { data: rawSuggestions, error: suggestionError } = await supabase
      .from('suggestions')
      .select('id, item, user_id, created_at, event_id, custom_thumb, url_background')
      .eq('event_id', props.eventId);

    if (suggestionError) {
      console.error('Error fetching suggestions:', suggestionError);
      return;
    }
    
    // Process the raw suggestions to count occurrences of each item
    const suggestionCounts = new Map();
    const suggestionIds = new Map();
    const suggestionThumbs = new Map();
    
    // Count occurrences and keep track of the first ID, thumbnail, and background for each unique item
    const suggestionBackgrounds = new Map();
    
    rawSuggestions?.forEach(suggestion => {
      const item = suggestion.item;
      const count = suggestionCounts.get(item) || 0;
      
      // Store the first ID we encounter for each unique item
      if (!suggestionIds.has(item)) {
        suggestionIds.set(item, suggestion.id);
        // Store the thumbnail if available
        if (suggestion.custom_thumb) {
          suggestionThumbs.set(item, suggestion.custom_thumb);
        }
        // Store the background if available
        if (suggestion.url_background) {
          suggestionBackgrounds.set(item, suggestion.url_background);
        }
      }
      
      suggestionCounts.set(item, count + 1);
    });
    
    // Find the original suggestion object for each unique item
    const originalSuggestions = new Map();
    rawSuggestions?.forEach(suggestion => {
      if (!originalSuggestions.has(suggestion.item) && suggestionIds.get(suggestion.item) === suggestion.id) {
        originalSuggestions.set(suggestion.item, suggestion);
      }
    });
    
    // Convert to the format expected by the UI
    const processedSuggestions = Array.from(suggestionCounts.entries()).map(([item, count]) => {
      // Get the original suggestion object
      const originalSuggestion = originalSuggestions.get(item) || {};
      
      return {
        // Keep the original suggestion ID
        id: suggestionIds.get(item),
        // Keep the original suggestion object properties
        ...originalSuggestion,
        // Override with aggregated data
        item,
        count,
        event_id: props.eventId,
        // Use stored thumbnail and background if available
        custom_thumb: suggestionThumbs.get(item) || null,
        url_background: suggestionBackgrounds.get(item) || null,
        url_thumb: null,
        provider: ''
      };
    });
    
    // Sort by count in descending order
    processedSuggestions.sort((a, b) => b.count - a.count);
    
    // Try to fetch game data for each suggestion that doesn't already have a thumbnail
    try {
      // We'll use the API to search for each game
      for (const suggestion of processedSuggestions) {
        // Skip if we already have a thumbnail
        if (suggestion.custom_thumb) {
          log('Using existing thumbnail for:', suggestion.item);
          continue;
        }
        
        log('Fetching thumbnail for:', suggestion.item);
        const response = await fetch(`${import.meta.env.BASE_URL || '/'}api/games`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            search: suggestion.item,
            page: 1,
            perPage: 1
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.games && data.games.length > 0) {
            // Find the best match
            const exactMatch = data.games.find(g => 
              g.name.toLowerCase() === suggestion.item.toLowerCase()
            );
            const game = exactMatch || data.games[0];
            
            // Update the suggestion with game data
            suggestion.custom_thumb = game.custom_thumb || game.url_thumb;
            suggestion.url_background = game.url_background || null;
            suggestion.provider = game.provider;
            
            // Save the thumbnail and background URLs to the database
            await saveCustomThumb(suggestion.id, suggestion.custom_thumb, suggestion.url_background);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching game data for suggestions:', e);
      // Continue with placeholder images if game data fetch fails
    }
    
    suggestions.value = processedSuggestions;
    log('Suggestions processed:', suggestions.value.length);
    console.log(suggestions);
  } catch (e) {
    console.error('Exception during suggestions fetching:', e);
  }
};

// Fetch hunt list for the selected event
const fetchHuntList = async () => {
  try {
    log('Fetching hunt list for event:', props.eventId);
    
    // First fetch hunt items without joins
    const { data: huntItemsData, error: huntItemsError } = await supabase
      .from('hunt_items')
      .select('*')
      .eq('event_id', props.eventId);

    if (huntItemsError) {
      console.error('Error fetching hunt items:', huntItemsError);
      return;
    }

    // Then fetch the related suggestions separately
    if (huntItemsData && huntItemsData.length > 0) {
      const suggestionIds = huntItemsData.map(item => item.suggestion_id);
      
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('id, item')
        .in('id', suggestionIds);
        
      if (suggestionsError) {
        console.error('Error fetching suggestions for hunt items:', suggestionsError);
        return;
      }
      
      // Create a map of suggestion id to item text
      const suggestionMap = new Map();
      suggestionsData?.forEach(suggestion => {
        suggestionMap.set(suggestion.id, suggestion.item);
      });
      
      // Join the data manually
      huntList.value = huntItemsData.map(huntItem => ({
        ...huntItem,
        item: suggestionMap.get(huntItem.suggestion_id) || 'Unknown item'
      }));
    } else {
      huntList.value = [];
    }
    
    log('Hunt list fetched:', huntList.value.length);
  } catch (e) {
    console.error('Exception during hunt list fetching:', e);
  }
};

// Update a hunt item
const updateHuntItem = async (item: any) => {
  try {
    // Check if item should be marked as completed
    const isCompleted = 
      item.wager !== null && 
      item.result !== null && 
      (item.bonus || item.super_bonus);
    
    const { error } = await supabase
      .from('hunt_items')
      .update({
        wager: item.wager,
        result: item.result,
        bonus: item.bonus,
        super_bonus: item.super_bonus,
        completed: isCompleted
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

// Add a single suggestion to the hunt list
const addToHunt = async (suggestion: any) => {
  try {
    log('Adding suggestion to hunt list:', suggestion.item);
    log('Suggestion object details:', JSON.stringify(suggestion, null, 2));
    
    // Check if this item already exists in the hunt list
    // We need to fetch the hunt list items with their associated suggestions to check
    const { data: existingItems, error: fetchError } = await supabase
      .from('hunt_items')
      .select('suggestion_id')
      .eq('event_id', props.eventId);
      
    if (fetchError) {
      console.error('Error checking existing hunt items:', fetchError);
      return;
    }
    
    // Check if the suggestion is already in the hunt list
    const itemExists = existingItems.some(item => item.suggestion_id === suggestion.id);
    
    if (itemExists) {
      log('Item already exists in hunt list:', suggestion.item);
      alert(`"${suggestion.item}" is already in the hunt list.`);
      return;
    }
    
    // Create the hunt item with thumbnail and background URLs
    const { error } = await supabase.from('hunt_items').insert({
      event_id: props.eventId,
      suggestion_id: suggestion.id,
      wager: 1,
      result: 0,
      bonus: false,
      super_bonus: false,
      completed: false,
      custom_thumb: suggestion.custom_thumb || null,
      url_background: suggestion.url_background || null
    });

    if (error) {
      console.error('Error adding suggestion to hunt list:', error);
      return;
    }
    
    await fetchHuntList();
    log('Suggestion added to hunt list:', suggestion.item);
  } catch (e) {
    console.error('Exception during adding suggestion to hunt list:', e);
  }
};

// Remove a hunt item
const removeFromHunt = async (id: string) => {
  try {
    log('Removing hunt item:', id);
    
    const { error } = await supabase
      .from('hunt_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing hunt item:', error);
      return;
    }
    
    await fetchHuntList();
    log('Hunt item removed:', id);
  } catch (e) {
    console.error('Exception during removing hunt item:', e);
  }
};

// Set up real-time subscriptions
const setupRealTimeSubscriptions = () => {
  log('Setting up real-time subscriptions');
  
  // Subscribe to suggestions changes
  const suggestionsCleanup = subscribeSuggestions(props.eventId, (payload: SuggestionPayload) => {
    log('Received suggestion change:', payload.new?.event_id);
    
    // Add visual indication for new suggestions
    if (payload.new?.item) {
      recentlyAddedSuggestions.value.push(payload.new.item);
      setTimeout(() => {
        const index = recentlyAddedSuggestions.value.indexOf(payload.new.item);
        if (index !== -1) {
          recentlyAddedSuggestions.value.splice(index, 1);
        }
      }, 5000);
    }

    // Optimistically add the new suggestion if not already present
    if (payload.new && payload.new.id && payload.new.event_id === props.eventId) {
      const exists = suggestions.value.some(s => s.id === payload.new.id);
      if (!exists) {
        // You may need to adapt this shape if your suggestion objects differ
        suggestions.value.unshift({
          ...payload.new,
          count: 1 // or whatever default makes sense
        });
        log('Optimistically added new suggestion:', payload.new);
      }
    }

    // Schedule a fetch after a short delay to ensure consistency
    setTimeout(() => {
      log('Triggering fetchSuggestions due to real-time update (delayed for consistency)');
      fetchSuggestions();
    }, 500); // 0.5s delay
  });
  
  // Subscribe to hunt items changes
  const huntItemsCleanup = subscribeHuntItems(props.eventId, (payload: HuntItemPayload) => {
    log('Received hunt item change');
    fetchHuntList();
  });
  
  // Return cleanup functions
  return { suggestionsCleanup, huntItemsCleanup };
};

// Cleanup subscriptions
const cleanupSubscriptions = (cleanupFunctions: any) => {
  if (cleanupFunctions?.suggestionsCleanup) {
    cleanupFunctions.suggestionsCleanup();
  }
  if (cleanupFunctions?.huntItemsCleanup) {
    cleanupFunctions.huntItemsCleanup();
  }
};

onMounted(async () => {
  try {
    log('Component mounted, event ID:', props.eventId);
    
    // Fetch initial data
    await fetchSuggestions();
    await fetchHuntList();
    
    // Set up real-time subscriptions
    const cleanupFunctions = setupRealTimeSubscriptions();
    
    // Store cleanup functions for later use
    onUnmounted(() => {
      log('Component unmounting, cleaning up subscriptions');
      cleanupSubscriptions(cleanupFunctions);
    });
    
    log('Component mounted successfully');
  } catch (error) {
    console.error('Error during component mounting:', error);
  }
});

// Handle image errors
const handleImageError = (event: Event, suggestion: any) => {
  const target = event.target as HTMLImageElement;
  // Use a placeholder if image fails
  target.src = getPlaceholderImage(suggestion.item);
};

// Get placeholder image for a game
const getPlaceholderImage = (gameName: string) => {
  return `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatItemName(gameName))}`;
};

onUnmounted(() => {
  log('Component unmounting');
});
</script>
