<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Available Items</h2>
      <div class="space-y-4">
        <div
          v-for="item in availableItems"
          :key="item"
          class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          @click="suggestItem(item)"
        >
          <span>{{ item }}</span>
          <span class="text-gray-600">Available</span>
        </div>
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
          <span>{{ item }}</span>
          <span class="text-green-600">Suggested</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';

const props = defineProps<{
  eventId: string;
  userId: string;
}>();

const supabase = getSupabaseClient();
const availableItems = ref<string[]>([]);
const suggestedItems = ref<string[]>([]);
const allItems = [
  'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
  'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10'
];

onMounted(async () => {
  await fetchSuggestions();
  
  // Set up real-time subscription to update when new suggestions are made
  const channel = supabase
    .channel('suggestion-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'suggestions', filter: `event_id=eq.${props.eventId}` },
      payload => {
        fetchSuggestions();
      }
    )
    .subscribe();
    
  // Clean up subscription when component unmounts
  onUnmounted(() => {
    supabase.removeChannel(channel);
  });
});

const fetchSuggestions = async () => {
  const { data: suggestions, error } = await supabase
    .from('suggestions')
    .select('item')
    .eq('event_id', props.eventId)
    .eq('user_id', props.userId);

  if (error) throw error;
  
  suggestedItems.value = suggestions.map(s => s.item);
  availableItems.value = allItems.filter(item => !suggestedItems.value.includes(item));
};

const suggestItem = async (item: string) => {
  const { error } = await supabase.from('suggestions').insert([
    {
      event_id: props.eventId,
      item,
      user_id: props.userId
    }
  ]);

  if (error) throw error;
  
  await fetchSuggestions();
};
</script>
