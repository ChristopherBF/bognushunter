<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Suggestions for Event</h2>
        <button
          @click="addSelectedToHunt"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          :disabled="!selectedSuggestions.length"
        >
          Add to Hunt List
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
        >
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span>{{ suggestion.item }}</span>
              <span class="text-sm text-gray-600">{{ suggestion.count }} suggestions</span>
            </div>
          </div>
          <input
            type="checkbox"
            v-model="selectedSuggestions"
            :value="suggestion.id"
            class="w-4 h-4"
          />
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
            <span>{{ huntItem.item }}</span>
            <div class="flex items-center gap-4">
              <input
                type="number"
                v-model="huntItem.wager"
                class="w-24 px-2 py-1 border rounded"
                @input="updateHuntItem(huntItem)"
              />
              <input
                type="number"
                v-model="huntItem.result"
                class="w-24 px-2 py-1 border rounded"
                @input="updateHuntItem(huntItem)"
              />
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="huntItem.bonus"
                  class="w-4 h-4"
                  @change="updateHuntItem(huntItem)"
                />
                <label>Bonus</label>
                <input
                  type="checkbox"
                  v-model="huntItem.super_bonus"
                  class="w-4 h-4"
                  @change="updateHuntItem(huntItem)"
                />
                <label>Super Bonus</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';

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
const selectedSuggestions = ref<string[]>([]);

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
      wager: 0,
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

// Add selected suggestions to the hunt list
const addSelectedToHunt = async () => {
  try {
    log('Adding selected suggestions to hunt list:', selectedSuggestions.value);
    
    if (selectedSuggestions.value.length === 0) {
      return;
    }
    
    // Get the selected suggestions
    const selectedItems = suggestions.value.filter(suggestion => 
      selectedSuggestions.value.includes(suggestion.id)
    );
    
    // Filter out items that already exist in the hunt list
    const newItems = selectedItems.filter(suggestion => 
      !huntList.value.some(item => item.item === suggestion.item)
    );
    
    // If all selected items already exist, show a message
    if (newItems.length === 0) {
      alert('All selected items are already in the hunt list.');
      return;
    }
    
    // If some items already exist, show a message
    if (newItems.length < selectedItems.length) {
      const skippedCount = selectedItems.length - newItems.length;
      alert(`${skippedCount} item(s) were already in the hunt list and will be skipped.`);
    }
    
    // Prepare the items to insert
    const itemsToInsert = newItems.map(suggestion => ({
      event_id: props.eventId,
      suggestion_id: suggestion.id,
      wager: 0,
      result: 0,
      bonus: false,
      super_bonus: false,
      completed: false
    }));
    
    if (itemsToInsert.length > 0) {
      const { error } = await supabase.from('hunt_items').insert(itemsToInsert);
      
      if (error) {
        console.error('Error adding suggestions to hunt list:', error);
        return;
      }
    }
    
    // Clear the selection
    selectedSuggestions.value = [];
    
    // Refresh the hunt list
    await fetchHuntList();
    log('Selected suggestions added to hunt list');
  } catch (e) {
    console.error('Exception during adding selected suggestions to hunt list:', e);
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
