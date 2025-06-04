<template>
  <div class="space-y-6">
    <div class="bg-brown border-2 border-orange rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-display mb-1 flex-grow text-gold">Bognus Hunts</h2>
        <!-- Using a button with ref for direct access -->
        <button
          ref="createEventButtonRef"
          type="button"
          class="px-6 py-3 font-display bg-orange-700 text-gold rounded shadow-md hover:bg-orange-800 transform hover:scale-105 transition-transform"
        >
          Create Hunt
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="p-4 border border-streamer-text-secondary/40 rounded-lg hover:bg-orange-900/40 cursor-pointer shadow"
        >
          <div class="flex justify-between items-center">
            <span>{{ formatDate(event.date) }}</span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-streamer-text-secondary">{{ event.suggestions_count }} suggestions</span>
              <div class="flex space-x-2">
                <button 
                  @click="viewSuggestions(event.id)"
                  class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150"
                >
                  View Suggestions
                </button>
                <button 
                  @click="viewSummary(event.id)"
                  class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150"
                >
                  View Summary
                </button>
                <button 
                  @click="viewHuntList(event.id)"
                  class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150"
                >
                  Hunt List
                </button>
                <button 
                  @click="shareSuggestionLink(event.id)"
                  class="px-3 py-1 bg-orange-700 text-gold text-sm rounded hover:bg-orange-800 hover:text-gold shadow transition-colors duration-150"
                >
                  Share Link
                </button>
              </div>
            </div>
          </div>
          <!-- Notification for copied link -->
          <div v-if="copiedEventId === event.id" class="mt-2 text-sm text-streamer-green-accent flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Link copied to clipboard!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { subscribeSuggestions, unsubscribeAll, type SuggestionPayload } from '../../lib/realtime';

// Debug flag
const DEBUG = true;
const log = (...args: any[]) => DEBUG && console.log('[AdminDashboard]', ...args);

// Create a ref for the button
const createEventButtonRef = ref<HTMLButtonElement | null>(null);

log('Component script initialization');

const props = defineProps<{
  eventId?: string;
  userId: string;
}>();

log('Props received:', props);

const supabase = getSupabaseClient();
const events = ref<any[]>([]);
const copiedEventId = ref<string | null>(null);

// Handle the create event
const handleCreateEvent = async (e?: Event) => {
  log('Create event triggered', e);
  log('User ID:', props.userId);
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  if (!props.userId) {
    console.error('Error: No user ID provided');
    return;
  }
  
  try {
    log('Inserting new event into suggestion_events table');
    const { data, error } = await supabase.from('suggestion_events').insert([
      {
        date: new Date().toISOString(),
        created_by: props.userId,
        starting_balance: 0
      }
    ]);

    if (error) {
      console.error('Error creating event:', error);
      return;
    }
    
    log('Event created successfully:', data);
    await fetchEvents();
  } catch (e) {
    console.error('Exception during event creation:', e);
  }
};

// Keep the original createEvent function for compatibility
const createEvent = handleCreateEvent;

// Set up real-time subscriptions for all events
const setupRealTimeSubscriptions = () => {
  log('Setting up real-time subscriptions for all events');
  
  // Store cleanup functions for each event
  const cleanupFunctions: Record<string, () => void> = {};
  
  // Subscribe to suggestions for each event
  events.value.forEach(event => {
    log(`Setting up subscription for event ${event.id}`);
    cleanupFunctions[event.id] = subscribeSuggestions(event.id, (payload: SuggestionPayload) => {
      log(`Received suggestion change for event ${event.id}:`, payload);
      
      // Update the count for this event
      const eventIndex = events.value.findIndex(e => e.id === event.id);
      if (eventIndex !== -1) {
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          events.value[eventIndex].suggestions_count += 1;
          log(`Incremented count for event ${event.id} to ${events.value[eventIndex].suggestions_count}`);
        } else if (payload.eventType === 'DELETE') {
          events.value[eventIndex].suggestions_count = Math.max(0, events.value[eventIndex].suggestions_count - 1);
          log(`Decremented count for event ${event.id} to ${events.value[eventIndex].suggestions_count}`);
        }
      }
    });
  });
  
  // Return cleanup function that will unsubscribe all
  return () => {
    log('Cleaning up all subscriptions');
    Object.values(cleanupFunctions).forEach(cleanup => cleanup());
  };
};

onMounted(async () => {
  log('Component mounted');
  
  try {
    // Wait for the next tick to ensure the DOM is fully rendered
    await nextTick();
    
    // Set up the click event listener for the create event button
    if (createEventButtonRef.value) {
      log('Adding event listener to create event button');
      createEventButtonRef.value.addEventListener('click', handleCreateEvent);
      createEventButtonRef.value.addEventListener('mousedown', () => {
        log('Button mousedown event detected');
      });
    } else {
      console.error('Create event button ref not found');
    }
    
    log('Fetching initial data...');
    
    try {
      log('Calling fetchEvents');
      await fetchEvents();
      log('fetchEvents completed successfully');
      
      // Set up real-time subscriptions after events are loaded
      log('Setting up real-time subscriptions');
      const cleanup = setupRealTimeSubscriptions();
      
      // Clean up subscriptions when component unmounts
      onUnmounted(() => {
        log('Component unmounting, cleaning up subscriptions');
        cleanup();
        
        if (createEventButtonRef.value) {
          log('Removing event listeners');
          createEventButtonRef.value.removeEventListener('click', handleCreateEvent);
        }
      });
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    }

    log('Component mounted successfully');
  } catch (error) {
    console.error('Error during component mounting:', error);
  }
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Changed to navigate to a summary page instead of showing inline
const viewSummary = (eventId: string) => {
  log('Navigating to summary page for event:', eventId);
  const basePath = import.meta.env.BASE_URL || '/';
  window.location.href = `${basePath}summary/${eventId}`;
};

const viewHuntList = (eventId: string) => {
  log('Navigating to hunt list page for event:', eventId);
  const basePath = import.meta.env.BASE_URL || '/';
  window.location.href = `${basePath}huntlist/${eventId}`;
};

// Share suggestion link function
const shareSuggestionLink = (eventId: string) => {
  log('Sharing suggestion link for event:', eventId);
  
  // Get the base URL of the site
  const baseUrl = window.location.origin;
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Create the full URL to the suggestion page for this event
  const suggestionUrl = `${baseUrl}${basePath}suggest/${eventId}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(suggestionUrl)
    .then(() => {
      log('Link copied to clipboard:', suggestionUrl);
      copiedEventId.value = eventId;
      
      // Clear the copied notification after a few seconds
      setTimeout(() => {
        if (copiedEventId.value === eventId) {
          copiedEventId.value = null;
        }
      }, 3000);
    })
    .catch(err => {
      console.error('Error copying link to clipboard:', err);
      alert('Failed to copy link. Please try again.');
    });
};

const fetchEvents = async () => {
    log('Fetching events');
    
    // First, fetch all events
    const { data: eventsData, error: eventsError } = await supabase
      .from('suggestion_events')
      .select('*')
      .order('date', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return;
    }
    
    // Then, for each event, get the count of suggestions
    const eventsWithCounts = await Promise.all((eventsData || []).map(async (event) => {
      const { count, error: countError } = await supabase
        .from('suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
        
      if (countError) {
        console.error(`Error counting suggestions for event ${event.id}:`, countError);
        return { ...event, suggestions_count: 0 };
      }
      
      return { ...event, suggestions_count: count || 0 };
    }));
    
    events.value = eventsWithCounts;
    log('Events fetched:', events.value);
};

const viewSuggestions = (eventId: string) => {
  log('Navigating to suggestions page for event:', eventId);
  const basePath = import.meta.env.BASE_URL || '/';
  window.location.href = `${basePath}suggestions/${eventId}`;
};
</script>
