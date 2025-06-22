<template>
    <div class="space-y-6">
        <div class="bg-brown border-2 border-orange rounded-xl shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-display mb-1 flex-grow text-gold">Bognus Hunts</h2>
                <!-- Using a button with ref for direct access -->
                <button ref="createEventButtonRef" type="button" @click="showCreateEventModal = true"
                    class="px-6 py-3 font-display bg-orange-700 text-gold rounded shadow-md hover:bg-orange-800 transform hover:scale-105 transition-transform">
                    Create Hunt
                </button>
            </div>
            <div class="space-y-4">
                <!-- Open Events -->
                <EventListItem v-for="event in events.filter(e => e.open)" :key="event.id" :event="event"
                    @view-suggestions="viewSuggestions" @view-summary="viewSummary" @view-hunt-list="viewHuntList"
                    @share-link="shareSuggestionLink" @close-event="handleCloseEvent" />
                <!-- Closed Events -->
                <template v-if="events.some(e => !e.open)">
                    <hr class="my-6 border-orange/40">
                    <h3 class="text-lg text-gold mb-2">Closed Hunts</h3>
                    <EventListItem v-for="event in events.filter(e => !e.open)" :key="event.id" :event="event"
                        @view-suggestions="viewSuggestions" @view-summary="viewSummary" @view-hunt-list="viewHuntList"
                        @share-link="shareSuggestionLink" @close-event="handleCloseEvent" />
                </template>
                <!-- Notification for copied link -->
                <div v-if="copiedEventId" class="mt-2 text-sm text-streamer-green-accent flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Link copied to clipboard!
                </div>
            </div>
        </div>
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateEventModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-brown-dark border-2 border-orange rounded-xl shadow-lg p-6 w-96 max-w-md">
            <h3 class="text-xl font-display text-gold mb-4">Create New Hunt</h3>

            <div class="mb-4">
                <label for="startingBalance" class="block text-sm font-medium text-gold mb-1">Starting Balance</label>
                <input id="startingBalance" v-model="startingBalance" type="number" min="0" step="1"
                    class="w-full px-3 py-2 border border-orange rounded bg-brown text-gold focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="Enter starting balance" />
            </div>

            <div class="flex justify-end space-x-3 mt-6">
                <button @click="showCreateEventModal = false"
                    class="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors">
                    Cancel
                </button>
                <button @click="handleCreateEvent()"
                    class="px-4 py-2 bg-orange-700 text-gold rounded hover:bg-orange-600 transition-colors">
                    Create Hunt
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getSupabaseClient } from '../../lib/supabase';
import { subscribeSuggestions, unsubscribeAll, type SuggestionPayload } from '../../lib/realtime';
import { showSuccess, showError, showInfo, showWarning } from '../../lib/toast';
import { createEvent as createEventService, fetchEvents as fetchEventsService, closeEvent as closeEventService } from '../../services/eventService';
import EventListItem from './EventListItem.vue';
import 'vue3-toastify/dist/index.css';
import '../../styles/toast.css';

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

// Modal state
const showCreateEventModal = ref(false);
const startingBalance = ref(1000); // Default starting balance

// Handle closing an event
const handleCloseEvent = async (eventId: string) => {
    // AJAX close: call service, update UI, show toast
    const idx = events.value.findIndex(e => e.id === eventId);
    if (idx === -1) return;
    const prevOpen = events.value[idx].open;
    // Optimistically close in UI
    events.value[idx].open = false;
    const { success, error } = await closeEventService(eventId);
    if (success) {
        showSuccess('Event closed!');
    } else {
        // Revert if error
        events.value[idx].open = prevOpen;
        showError(error?.message || 'Failed to close event');
        if (error) {
            showError(`Failed to close event: ${error.message}`);
            return;
        }
        if (success) {
            events.value[idx].open = false;
            showSuccess('Event closed successfully');
        }
    }
};

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
        showError('Error: User ID is required to create a hunt');
        return;
    }

    // Validate starting balance
    if (startingBalance.value <= 0) {
        showWarning('Starting balance must be greater than zero');
        return;
    }

    try {
        log('Creating new hunt using event service with starting balance:', startingBalance.value);
        showInfo('Creating new hunt...');

        // Use the createEventService function with the starting balance
        const huntName = `Hunt ${new Date().toLocaleDateString()}`;
        const { event, error } = await createEventService(huntName, props.userId, startingBalance.value);

        if (error) {
            console.error('Error creating event:', error);
            showError(`Failed to create hunt: ${error.message}`);
            return;
        }

        if (!event) {
            console.error('Failed to create event: No event data returned');
            showError('Failed to create hunt: Unknown error');
            return;
        }

        log('Event created successfully:', event);
        showSuccess('Hunt created successfully!');

        // Close the modal
        showCreateEventModal.value = false;

        // Reset starting balance for next time
        startingBalance.value = 1000;

        // Refresh the events list
        await fetchEvents();
    } catch (error) {
        console.error('Error in handleCreateEvent:', error);
        showError('An unexpected error occurred while creating the hunt');
    }
};

// No longer need a separate createEvent function since we're using the service

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

        // No need to add event listeners to the button anymore since we're using v-on:click
        // The button now just opens the modal, and the actual event creation happens from the modal
        if (!createEventButtonRef.value) {
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
    showInfo('Loading summary page...');
    const basePath = import.meta.env.BASE_URL || '/';
    window.location.href = `${basePath}summary/${eventId}`;
};

const viewHuntList = (eventId: string) => {
    log('Navigating to hunt list page for event:', eventId);
    showInfo('Loading hunt list page...');
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
            showSuccess('Link copied to clipboard!');

            // Clear the copied notification after a few seconds
            setTimeout(() => {
                if (copiedEventId.value === eventId) {
                    copiedEventId.value = null;
                }
            }, 3000);
        })
        .catch(err => {
            console.error('Error copying link to clipboard:', err);
            showError('Failed to copy link. Please try again.');
        });
};

const fetchEvents = async () => {
    log('Fetching events');

    try {
        if (!props.userId) {
            console.error('Error: No user ID provided for fetching events');
            showError('Error: User ID is required to fetch hunts');
            return;
        }

        // Use the fetchEventsService to get events
        const { events: fetchedEvents, error } = await fetchEventsService(props.userId);

        if (error) {
            console.error('Error fetching events:', error);
            showError(`Failed to fetch hunts: ${error.message}`);
            return;
        }

        // Update the events ref with the fetched events
        events.value = fetchedEvents;
        log('Events fetched:', events.value);
    } catch (error) {
        console.error('Error in fetchEvents:', error);
        showError('Failed to load hunts. Please try again.');
    }
};

const viewSuggestions = (eventId: string) => {
    log('Navigating to suggestions page for event:', eventId);
    showInfo('Loading suggestions page...');
    const basePath = import.meta.env.BASE_URL || '/';
    window.location.href = `${basePath}suggestions/${eventId}`;
};
</script>
