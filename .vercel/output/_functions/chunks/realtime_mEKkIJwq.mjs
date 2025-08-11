import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';

const activeSubscriptions = {};
function subscribeSuggestions(eventId, callback) {
  const supabase = getSupabaseClient();
  const channelId = `suggestions-${eventId}`;
  console.log("[RealTime] [DEBUG] subscribeSuggestions CALLED for event:", eventId);
  if (activeSubscriptions[channelId]) {
    console.log("[RealTime] [DEBUG] Reusing existing subscription for event:", eventId);
    activeSubscriptions[channelId].callbacks.push(callback);
    return () => unsubscribeSuggestions(eventId, callback);
  }
  const channel = supabase.channel(channelId).on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "suggestions",
      filter: `event_id=eq.${eventId}`
      // Add filter for event_id to only get relevant changes
    },
    (rawPayload) => {
      console.log("[RealTime] [DEBUG] postgres_changes callback FIRED");
      console.log("[RealTime] [DEBUG] Raw payload:", rawPayload);
      const payload = {
        ...rawPayload,
        eventType: rawPayload.eventType
      };
      if (payload.new) {
        console.log("[RealTime] [DEBUG] payload.new.event_id:", payload.new.event_id, "expected:", eventId);
      }
      console.log("[RealTime] [DEBUG] Triggering callbacks for event:", eventId);
      activeSubscriptions[channelId].callbacks.forEach((cb) => cb(payload));
    }
  ).subscribe();
  console.log("[RealTime] [DEBUG] Called .subscribe() for channel:", channelId);
  activeSubscriptions[channelId] = {
    channel,
    callbacks: [callback]
  };
  console.log("[RealTime] [DEBUG] Suggestions subscription set up for event:", eventId);
  return () => unsubscribeSuggestions(eventId, callback);
}
function unsubscribeSuggestions(eventId, callback) {
  const channelId = `suggestions-${eventId}`;
  const subscription = activeSubscriptions[channelId];
  if (!subscription) return;
  subscription.callbacks = subscription.callbacks.filter((cb) => cb !== callback);
  if (subscription.callbacks.length === 0) {
    console.log("[RealTime] No more callbacks for event:", eventId, "unsubscribing");
    subscription.channel.unsubscribe();
    delete activeSubscriptions[channelId];
  }
}
function subscribeHuntItems(eventId, callback) {
  const supabase = getSupabaseClient();
  const channelId = `hunt-items-${eventId}`;
  console.log("[RealTime] Setting up hunt items subscription for event:", eventId);
  if (activeSubscriptions[channelId]) {
    console.log("[RealTime] Reusing existing subscription for event:", eventId);
    activeSubscriptions[channelId].callbacks.push(callback);
    return () => unsubscribeHuntItems(eventId, callback);
  }
  const channel = supabase.channel(channelId).on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "hunt_items",
      filter: `event_id=eq.${eventId}`
      // Add filter for event_id to only get relevant changes
    },
    (payload) => {
      console.log("[RealTime] Received hunt item change");
      console.log("[RealTime] Triggering callbacks for hunt item change in event:", eventId);
      activeSubscriptions[channelId].callbacks.forEach((cb) => cb(payload));
    }
  ).subscribe();
  activeSubscriptions[channelId] = {
    channel,
    callbacks: [callback]
  };
  return () => unsubscribeHuntItems(eventId, callback);
}
function unsubscribeHuntItems(eventId, callback) {
  const channelId = `hunt-items-${eventId}`;
  const subscription = activeSubscriptions[channelId];
  if (!subscription) return;
  subscription.callbacks = subscription.callbacks.filter((cb) => cb !== callback);
  if (subscription.callbacks.length === 0) {
    console.log("[RealTime] No more callbacks for event:", eventId, "unsubscribing");
    subscription.channel.unsubscribe();
    delete activeSubscriptions[channelId];
  }
}

export { subscribeHuntItems as a, subscribeSuggestions as s };
