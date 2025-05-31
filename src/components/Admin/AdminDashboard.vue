<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Suggestion Events</h2>
        <button
          @click="createEvent"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Event
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          @click="selectEvent(event.id)"
        >
          <div class="flex justify-between items-center">
            <span>{{ formatDate(event.date) }}</span>
            <span class="text-sm text-gray-600">{{ event.suggestions_count }} suggestions</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedEvent" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Suggestions</h2>
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

    <div v-if="selectedEvent" class="bg-white rounded-lg shadow p-6">
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

    <div v-if="selectedEvent" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Summary</h2>
      <div class="space-y-4">
        <div
          v-for="summaryItem in summaryList"
          :key="summaryItem.id"
          class="p-3 border rounded-lg"
        >
          <div class="flex justify-between">
            <span>{{ summaryItem.item }}</span>
            <div class="flex items-center gap-4">
              <span>Wager: {{ summaryItem.wager }}</span>
              <span>Result: {{ summaryItem.result }}</span>
              <span>Bonus: {{ summaryItem.bonus ? 'Yes' : 'No' }}</span>
              <span>Super Bonus: {{ summaryItem.super_bonus ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
        <div class="border-t pt-4">
          <div class="flex justify-between text-lg font-semibold">
            <span>Total Results:</span>
            <span>{{ totalResults }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold">
            <span>Total Items Completed:</span>
            <span>{{ summaryList.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';

const props = defineProps<{
  eventId?: string;
  userId: string;
}>();

const supabase = getSupabaseClient();
const events = ref<any[]>([]);
const suggestions = ref<any[]>([]);
const huntList = ref<any[]>([]);
const summaryList = ref<any[]>([]);
const selectedEvent = ref<string | null>(props.eventId || null);
const selectedSuggestions = ref<string[]>([]);

onMounted(async () => {
  await fetchEvents();
  if (selectedEvent.value) {
    await fetchSuggestions();
    await fetchHuntList();
    await fetchSummary();
  }

  // Set up real-time subscription for changes
  const suggestionsChannel = supabase
    .channel('suggestions-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'suggestions' },
      payload => {
        if (selectedEvent.value && payload.new?.event_id === selectedEvent.value) {
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
      payload => {
        if (selectedEvent.value && payload.new?.event_id === selectedEvent.value) {
          fetchHuntList();
          fetchSummary();
        }
      }
    )
    .subscribe();
    
  // Clean up subscriptions when component unmounts
  onUnmounted(() => {
    supabase.removeChannel(suggestionsChannel);
    supabase.removeChannel(huntItemsChannel);
  });
});

const totalResults = computed(() => {
  return summaryList.value.reduce((sum, item) => sum + item.result, 0);
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const createEvent = async () => {
  const { error } = await supabase.from('suggestion_events').insert([
    {
      date: new Date().toISOString(),
      created_by: props.userId
    }
  ]);

  if (error) throw error;
  await fetchEvents();
};

const selectEvent = async (eventId: string) => {
  selectedEvent.value = eventId;
  await fetchSuggestions();
  await fetchHuntList();
  await fetchSummary();
};

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('suggestion_events')
    .select('*, suggestions_count:suggestions(count)')
    .order('date', { ascending: false });

  if (error) throw error;
  events.value = data || [];
};

const fetchSuggestions = async () => {
  const { data, error } = await supabase
    .from('suggestions')
    .select('id, item, count')
    .eq('event_id', selectedEvent.value)
    .order('count', { ascending: false });

  if (error) throw error;
  suggestions.value = data || [];
};

const fetchHuntList = async () => {
  const { data, error } = await supabase
    .from('hunt_items')
    .select('*, suggestion:suggestions(item)')
    .eq('event_id', selectedEvent.value);

  if (error) throw error;
  huntList.value = data?.map(item => ({
    ...item,
    item: item.suggestion?.item
  })) || [];
};

const fetchSummary = async () => {
  const { data, error } = await supabase
    .from('hunt_items')
    .select('*, suggestion:suggestions(item)')
    .eq('event_id', selectedEvent.value)
    .eq('completed', true);

  if (error) throw error;
  summaryList.value = data?.map(item => ({
    ...item,
    item: item.suggestion?.item
  })) || [];
};

const updateHuntItem = async (item: any) => {
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

  if (error) throw error;
};

const addSelectedToHunt = async () => {
  const selectedSuggestionsData = suggestions.value.filter(
    s => selectedSuggestions.value.includes(s.id)
  );

  const { error } = await supabase.from('hunt_items').insert(
    selectedSuggestionsData.map(suggestion => ({
      event_id: selectedEvent.value,
      suggestion_id: suggestion.id,
      wager: 0,
      result: 0,
      bonus: false,
      super_bonus: false,
      completed: false
    }))
  );

  if (error) throw error;
  await fetchHuntList();
  selectedSuggestions.value = [];
};
</script>
