import { getSupabaseClient } from './supabase';

// Type definitions for subscription payloads
export interface SuggestionPayload {
  new: {
    id?: string;
    event_id?: string;
    item?: string;
    count?: number;
    created_at?: string;
    custom_thumb?: string;
    url_thumb?: string;
    url_background?: string;
  };
}

export interface HuntItemPayload {
  new: {
    id?: string;
    event_id?: string;
    suggestion_id?: string;
    item?: string;
    wager?: number;
    result?: number;
    bonus?: boolean;
    super_bonus?: boolean;
    completed?: boolean;
    created_at?: string;
  };
}

// Type for subscription callbacks
export type SubscriptionCallback<T> = (payload: T) => void;

// Store active subscriptions
const activeSubscriptions: Record<string, any> = {};

/**
 * Subscribe to suggestion changes for a specific event
 * @param eventId The event ID to filter changes by
 * @param callback Function to call when a matching change occurs
 * @returns A cleanup function to unsubscribe
 */
export function subscribeSuggestions(eventId: string, callback: SubscriptionCallback<SuggestionPayload>) {
  const supabase = getSupabaseClient();
  const channelId = `suggestions-${eventId}`;
  
  console.log('[RealTime] [DEBUG] subscribeSuggestions CALLED for event:', eventId);
  
  // Check if we already have an active subscription for this event
  if (activeSubscriptions[channelId]) {
    console.log('[RealTime] [DEBUG] Reusing existing subscription for event:', eventId);
    // Add the callback to the existing subscription
    activeSubscriptions[channelId].callbacks.push(callback);
    return () => unsubscribeSuggestions(eventId, callback);
  }
  
  // Create a new subscription
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'suggestions' },
      (payload: SuggestionPayload) => {
        console.log('[RealTime] [DEBUG] postgres_changes callback FIRED');
        console.log('[RealTime] [DEBUG] Raw payload:', payload);
        if (payload.new) {
          console.log('[RealTime] [DEBUG] payload.new.event_id:', payload.new.event_id, 'expected:', eventId);
        }
        // Only trigger callbacks if the event_id matches
        if (payload.new && payload.new.event_id === eventId) {
          console.log('[RealTime] [DEBUG] Matched event ID, triggering callbacks');
          activeSubscriptions[channelId].callbacks.forEach((cb: SubscriptionCallback<SuggestionPayload>) => cb(payload));
        }
      }
    )
    .subscribe();
  
  console.log('[RealTime] [DEBUG] Called .subscribe() for channel:', channelId);
  // Store the subscription
  activeSubscriptions[channelId] = {
    channel,
    callbacks: [callback]
  };

  console.log('[RealTime] [DEBUG] Suggestions subscription set up for event:', eventId);
  
  // Return a cleanup function
  return () => unsubscribeSuggestions(eventId, callback);
}

/**
 * Unsubscribe a specific callback from suggestion changes
 * @param eventId The event ID the subscription is for
 * @param callback The callback to remove
 */
export function unsubscribeSuggestions(eventId: string, callback: SubscriptionCallback<SuggestionPayload>) {
  const channelId = `suggestions-${eventId}`;
  const subscription = activeSubscriptions[channelId];
  
  if (!subscription) return;
  
  // Remove this specific callback
  subscription.callbacks = subscription.callbacks.filter((cb: SubscriptionCallback<SuggestionPayload>) => cb !== callback);
  
  // If no callbacks remain, unsubscribe completely
  if (subscription.callbacks.length === 0) {
    console.log('[RealTime] No more callbacks for event:', eventId, 'unsubscribing');
    subscription.channel.unsubscribe();
    delete activeSubscriptions[channelId];
  }
}

/**
 * Subscribe to hunt item changes for a specific event
 * @param eventId The event ID to filter changes by
 * @param callback Function to call when a matching change occurs
 * @returns A cleanup function to unsubscribe
 */
export function subscribeHuntItems(eventId: string, callback: SubscriptionCallback<HuntItemPayload>) {
  const supabase = getSupabaseClient();
  const channelId = `hunt-items-${eventId}`;
  
  console.log('[RealTime] Setting up hunt items subscription for event:', eventId);
  
  // Check if we already have an active subscription for this event
  if (activeSubscriptions[channelId]) {
    console.log('[RealTime] Reusing existing subscription for event:', eventId);
    // Add the callback to the existing subscription
    activeSubscriptions[channelId].callbacks.push(callback);
    return () => unsubscribeHuntItems(eventId, callback);
  }
  
  // Create a new subscription
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'hunt_items' },
      (payload: HuntItemPayload) => {
        console.log('[RealTime] Received hunt item change');
        
        // Only trigger callbacks if the event_id matches
        if (payload.new && payload.new.event_id === eventId) {
          console.log('[RealTime] Matched event ID, triggering callbacks');
          activeSubscriptions[channelId].callbacks.forEach((cb: SubscriptionCallback<HuntItemPayload>) => cb(payload));
        }
      }
    )
    .subscribe();
  
  // Store the subscription
  activeSubscriptions[channelId] = {
    channel,
    callbacks: [callback]
  };
  
  // Return a cleanup function
  return () => unsubscribeHuntItems(eventId, callback);
}

/**
 * Unsubscribe a specific callback from hunt item changes
 * @param eventId The event ID the subscription is for
 * @param callback The callback to remove
 */
export function unsubscribeHuntItems(eventId: string, callback: SubscriptionCallback<HuntItemPayload>) {
  const channelId = `hunt-items-${eventId}`;
  const subscription = activeSubscriptions[channelId];
  
  if (!subscription) return;
  
  // Remove this specific callback
  subscription.callbacks = subscription.callbacks.filter((cb: SubscriptionCallback<HuntItemPayload>) => cb !== callback);
  
  // If no callbacks remain, unsubscribe completely
  if (subscription.callbacks.length === 0) {
    console.log('[RealTime] No more callbacks for event:', eventId, 'unsubscribing');
    subscription.channel.unsubscribe();
    delete activeSubscriptions[channelId];
  }
}

/**
 * Unsubscribe from all active subscriptions
 */
export function unsubscribeAll() {
  console.log('[RealTime] Unsubscribing from all channels');
  
  Object.values(activeSubscriptions).forEach((subscription: any) => {
    subscription.channel.unsubscribe();
  });
  
  // Clear the subscriptions object
  Object.keys(activeSubscriptions).forEach(key => {
    delete activeSubscriptions[key];
  });
}
