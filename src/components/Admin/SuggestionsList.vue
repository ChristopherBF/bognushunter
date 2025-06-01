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
          @click="addToHunt(suggestion)"
        >
          <div class="p-4 flex flex-col items-center text-center">
            <!-- Placeholder image/icon -->
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <!-- Item name -->
            <div class="font-medium">{{ formatItemName(suggestion.item) }}</div>
            
            <!-- Suggestion count badge -->
            <div class="mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ suggestion.count }} suggestions
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { formatItemName } from '../../lib/utils';

// Debug flag
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) console.log('[SuggestionsList]', ...args);
}

log('Component script initialization');

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

// Fetch suggestions for the selected event
const fetchSuggestions = async () => {
  try {
    log('Fetching suggestions for event:', props.eventId);
    
    // First, get all suggestions for this event
    const { data: rawSuggestions, error: suggestionError } = await supabase
      .from('suggestions')
      .select('id, item, user_id, created_at, event_id')
      .eq('event_id', props.eventId);

    if (suggestionError) {
      console.error('Error fetching suggestions:', suggestionError);
      return;
    }
    
    // Process the raw suggestions to count occurrences of each item
    const suggestionCounts = new Map();
    const suggestionIds = new Map();
    
    // Count occurrences and keep track of the first ID for each unique item
    rawSuggestions?.forEach(suggestion => {
      const item = suggestion.item;
      const count = suggestionCounts.get(item) || 0;
      
      // Store the first ID we encounter for each unique item
      if (!suggestionIds.has(item)) {
        suggestionIds.set(item, suggestion.id);
      }
      
      suggestionCounts.set(item, count + 1);
    });
    
    // Convert to the format expected by the UI
    const processedSuggestions = Array.from(suggestionCounts.entries()).map(([item, count]) => ({
      id: suggestionIds.get(item),
      item,
      count,
      event_id: props.eventId
    }));
    
    // Sort by count in descending order
    processedSuggestions.sort((a, b) => b.count - a.count);
    
    suggestions.value = processedSuggestions;
    log('Suggestions processed:', suggestions.value.length);
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
    
    const { error } = await supabase.from('hunt_items').insert({
      event_id: props.eventId,
      suggestion_id: suggestion.id,
      wager: 1,
      result: 0,
      bonus: false,
      super_bonus: false,
      completed: false
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

onMounted(async () => {
  try {
    log('Component mounted, event ID:', props.eventId);
    
    // Fetch initial data
    await fetchSuggestions();
    await fetchHuntList();
    
    // Set up real-time subscriptions
    log('Setting up real-time subscriptions');
    
    const suggestionsChannel = supabase
      .channel('suggestions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suggestions' },
        (payload: { new: { event_id?: string } }) => {
          if (props.eventId && payload.new?.event_id === props.eventId) {
            fetchSuggestions();
          }
        }
      )
      .subscribe();
      
    const huntItemsChannel = supabase
      .channel('hunt-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hunt_items' },
        (payload: { new: { event_id?: string } }) => {
          if (props.eventId && payload.new?.event_id === props.eventId) {
            fetchHuntList();
          }
        }
      )
      .subscribe();
      
    log('Component mounted successfully');
  } catch (error) {
    console.error('Error during component mounting:', error);
  }
});

onUnmounted(() => {
  log('Component unmounting');
  // Clean up subscriptions if needed
});
</script>
