<template>
    <div class="space-y-3 bg-brown text-gold">
        <div class="rounded-lg shadow p-3">
            <div class="mb-3">
                <h2 class="text-lg font-semibold text-orange">Bognus suggestions for hunt</h2>
                <p class="text-xs mt-1 opacity-75">Click on an item to add it to the hunt list</p>
            </div>

            <!-- Compact grid layout for suggestions -->
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                <SuggestionItem v-for="suggestion in suggestions" :key="suggestion.id" :suggestion="suggestion"
                    :recently-added="recentlyAddedSuggestions.includes(suggestion.item)" @add-to-hunt="addToHunt"
                    @image-error="handleSuggestionImageError" />
            </div>
        </div>

        <div class="rounded-lg shadow p-3">
            <h2 class="text-lg font-semibold mb-2 text-orange">Hunt List</h2>
            <div class="space-y-2">
                <HuntListItemSimple v-for="huntItem in huntList" :key="huntItem.id" :hunt-item="huntItem"
                    @remove="removeFromHunt" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import 'vue3-toastify/dist/index.css';
import { subscribeHuntItems, subscribeSuggestions } from '../../lib/realtime';
import type { HuntItemPayload, SuggestionPayload } from '../../types/payloads';
import { getSupabaseClient } from '../../lib/supabase';
import { showError, showInfo, showSuccess, showWarning } from '../../lib/toast';
import { formatItemName } from '../../lib/utils';
import {
    addToHunt as addToHuntService,
    fetchHuntList as fetchHuntListService,
    removeFromHunt as removeFromHuntService,
    updateHuntItem as updateHuntItemService
} from '../../services/huntItemService';
import {
    fetchGameDataForSuggestions as fetchGameDataService,
    fetchSuggestions as fetchSuggestionsService,
    saveCustomThumb as saveCustomThumbService
} from '../../services/suggestionService';
import '../../styles/toast.css';

// Import new components
import HuntListItemSimple from './HuntListItemSimple.vue';
import SuggestionItem from './SuggestionItem.vue';
import type { HuntItem } from '../../types/hunt';

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
const initialHuntListLoaded = ref<boolean>(false);
const initialSuggestionsLoaded = ref<boolean>(false);

// Save custom thumbnail and background URLs to the database using the service
const saveCustomThumb = async (suggestionId: string, thumbUrl: string, backgroundUrl: string | null = null) => {
    try {
        const { success, error } = await saveCustomThumbService(suggestionId, thumbUrl, backgroundUrl);

        if (error) {
            console.error('Error saving custom thumbnail:', error);
            return false;
        }

        return success;
    } catch (e) {
        console.error('Exception during saving custom thumbnail:', e);
        return false;
    }
};

// Fetch suggestions for the selected event
const fetchSuggestions = async () => {
    try {
        log('Fetching suggestions for event:', props.eventId);

        // Fetch suggestions using the service
        const { suggestions: processedSuggestions, error } = await fetchSuggestionsService(props.eventId);

        if (error) {
            console.error('Error fetching suggestions:', error);
            showError(`Failed to load suggestions: ${error.message}`);
            return;
        }

        // Try to fetch game data for each suggestion that doesn't already have a thumbnail
        try {
            const baseUrl = import.meta.env.BASE_URL || '/';
            const { updatedSuggestions, error: gameDataError } = await fetchGameDataService(processedSuggestions, baseUrl);

            if (gameDataError) {
                console.error('Error fetching game data for suggestions:', gameDataError);
                showWarning(`Some game thumbnails could not be loaded. Using placeholders instead.`);
            } else {
                // Use the updated suggestions with game data
                suggestions.value = updatedSuggestions;
            }
        } catch (e) {
            console.error('Error fetching game data for suggestions:', e);
            showWarning(`Some game thumbnails could not be loaded. Using placeholders instead.`);
            // Continue with placeholder images if game data fetch fails
            suggestions.value = processedSuggestions;
        }

        // Sort by count in descending order
        suggestions.value.sort((a, b) => b.count - a.count);

        log('Suggestions processed:', suggestions.value.length);
        console.log(suggestions);

        // Only show success toast on initial load, not on updates
        if (!initialSuggestionsLoaded.value) {
            initialSuggestionsLoaded.value = true;
            if (suggestions.value.length > 0) {
                showSuccess(`Loaded ${suggestions.value.length} suggestions`);
            } else {
                showInfo('No suggestions found for this hunt yet.');
            }
        }
    } catch (e) {
        console.error('Exception during suggestions fetching:', e);
        showError(`Failed to load suggestions: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
};

// Fetch hunt list for the selected event
const fetchHuntList = async () => {
    try {
        log('Fetching hunt list for event:', props.eventId);

        // Use the service to fetch hunt items
        const { huntItems, error } = await fetchHuntListService(props.eventId);

        if (error) {
            console.error('Error fetching hunt items:', error);
            showError(`Failed to load hunt list: ${error.message}`);
            return;
        }

        // Update the local state
        huntList.value = huntItems;

        log('Hunt list fetched:', huntList.value.length);

        // Only show success toast on initial load, not on updates
        if (!initialHuntListLoaded.value) {
            initialHuntListLoaded.value = true;
            if (huntList.value.length > 0) {
                showSuccess(`Hunt list loaded with ${huntList.value.length} items`);
            } else {
                showInfo('Hunt list is empty. Add items by clicking on suggestions.');
            }
        }
    } catch (e) {
        console.error('Exception during hunt list fetching:', e);
        showError(`Failed to load hunt list: ${e instanceof Error ? e.message : 'Unknown error'}`);
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

        // Create a complete hunt item object for the service
        const huntItemToUpdate: HuntItem = {
            id: item.id,
            event_id: item.event_id,
            suggestion_id: item.suggestion_id,
            wager: item.wager,
            result: item.result,
            bonus: item.bonus,
            super_bonus: item.super_bonus,
            completed: isCompleted,
            active: item.active,
            custom_thumb: item.custom_thumb,
            url_background: item.url_background,
            item: item.item
        };

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

        log('Hunt item updated:', item.id);
        showSuccess('Hunt item updated successfully');
    } catch (e) {
        console.error('Exception during hunt item update:', e);
        showError(`Failed to update hunt item: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
};

// Add a single suggestion to the hunt list
const addToHunt = async (suggestion: any) => {
    try {
        log('Adding suggestion to hunt list:', suggestion);

        // Check if the item is already in the hunt list
        const existingItem = huntList.value.find(item => item.item === suggestion.item);
        if (existingItem) {
            log('Item already exists in hunt list');
            showInfo(`"${formatItemName(suggestion.item)}" is already in the hunt list`);
            return;
        }

        showInfo(`Adding "${formatItemName(suggestion.item)}" to hunt list...`);

        // Use the service to add the item to the hunt list
        const { huntItem, error, exists } = await addToHuntService(props.eventId, suggestion);

        if (exists) {
            log('Item already exists in hunt list:', suggestion.item);
            showInfo(`"${formatItemName(suggestion.item)}" is already in the hunt list.`);
            return;
        }

        if (error) {
            console.error('Error adding suggestion to hunt list:', error);
            showError(`Failed to add "${formatItemName(suggestion.item)}" to hunt list: ${error.message}`);
            return;
        }

        await fetchHuntList();
        log('Suggestion added to hunt list:', suggestion.item);
        showSuccess(`"${formatItemName(suggestion.item)}" added to hunt list!`);
    } catch (e) {
        console.error('Exception during adding suggestion to hunt list:', e);
        showError(`Failed to add "${formatItemName(suggestion.item)}" to hunt list: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
};

// Remove a hunt item
const removeFromHunt = async (id: string) => {
    if (!id) {
        console.error('Invalid hunt item ID for removal');
        showError('Cannot remove item: Invalid ID');
        return;
    }

    // Store original list outside try/catch for error recovery
    const originalList = [...huntList.value];

    try {
        log('Removing hunt item with ID:', id);

        // Get the item name before removing it for the toast message
        const itemToRemove = huntList.value.find(item => item.id === id);
        const itemName = itemToRemove ? formatItemName(itemToRemove.item) : 'Item';

        // First update local state for immediate UI feedback (optimistic update)
        huntList.value = huntList.value.filter(item => item.id !== id);

        // Show info toast for the removal process
        showInfo(`Removing "${itemName}" from hunt list...`);

        // Make sure we have a valid event ID
        if (!props.eventId) {
            console.error('Missing event ID for hunt item removal');
            showError('Cannot remove item: Missing event ID');
            huntList.value = originalList;
            return;
        }

        // Use the service to remove the item
        const { success, error, data } = await removeFromHuntService(id);

        if (error) {
            console.error('Error removing hunt item:', error);
            // Restore original list if there was an error
            huntList.value = originalList;
            showError(`Failed to remove item: ${error.message}`);
            return;
        }

        if (!success) {
            console.error('Failed to remove hunt item');
            // Restore original list if there was an error
            huntList.value = originalList;
            showError('Failed to remove item: Unknown error');
            return;
        }

        log('Hunt item removed successfully from database');
        showSuccess(`"${itemName}" removed from hunt list!`);

        // Force a refetch to ensure UI is in sync with the database
        await fetchHuntList();
    } catch (e) {
        console.error('Exception during removing hunt item:', e);
        // Restore original list on exception
        huntList.value = originalList;
        // Show error toast
        showError(`An error occurred while removing the item: ${e instanceof Error ? e.message : 'Unknown error'}`);
        // Refetch the list to ensure UI is in sync with the database
        await fetchHuntList();
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

// Handle image errors from SuggestionItem component
const handleSuggestionImageError = async ({ suggestionId, type }: { suggestionId: string, type: string }) => {
    const suggestion = suggestions.value.find(s => s.id === suggestionId);
    if (!suggestion) return;

    try {
        log('Handling image error for suggestion:', suggestion.item);

        // Try to fetch game data to get a thumbnail
        const baseUrl = import.meta.env.BASE_URL || '/';
        const result = await fetchGameDataService([suggestion], baseUrl);

        if (result.error) {
            console.error('Error fetching game data:', result.error);
            return;
        }

        // Check if we got updated suggestions with thumbnails
        const updatedSuggestion = result.updatedSuggestions.find(s => s.id === suggestion.id);
        if (updatedSuggestion && updatedSuggestion.custom_thumb) {
            log('Found game data for', suggestion.item, updatedSuggestion);

            // The thumbnail is already saved to the database in the fetchGameDataService function
            // The realtime subscription will update the UI
            log('Custom thumb saved for', suggestion.item);
        }
    } catch (err) {
        console.error('Error in handleSuggestionImageError:', err);
    }
};

// Legacy handler for backward compatibility
const handleImageError = (event: Event, suggestion: any) => {
    const target = event.target as HTMLImageElement;
    // Use a placeholder if image fails
    target.src = getPlaceholderImage(suggestion.item);

    // Call the new handler
    handleSuggestionImageError({ suggestionId: suggestion.id, type: 'thumbnail' });
};

// Get placeholder image for a game
const getPlaceholderImage = (gameName: string) => {
    return `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(formatItemName(gameName))}`;
};

onUnmounted(() => {
    log('Component unmounting');
});
</script>
