import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';

async function fetchEvents(userId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("suggestion_events").select("*").eq("created_by", userId).order("date", { ascending: false });
    if (error) {
      return { events: [], error };
    }
    const events = await Promise.all(data.map(async (event) => {
      const { count: suggestionsCount, error: suggestionsError } = await supabase.from("suggestions").select("*", { count: "exact", head: true }).eq("event_id", event.id);
      const { count: huntItemsCount, error: huntItemsError } = await supabase.from("hunt_items").select("*", { count: "exact", head: true }).eq("event_id", event.id);
      return {
        ...event,
        suggestions_count: suggestionsError ? 0 : suggestionsCount || 0,
        hunt_items_count: huntItemsError ? 0 : huntItemsCount || 0
      };
    }));
    return { events, error: null };
  } catch (e) {
    return {
      events: [],
      error: e instanceof Error ? e : new Error("Unknown error fetching events")
    };
  }
}
async function createEvent(name, userId, startingBalance = 1e3) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("suggestion_events").insert({
      created_by: userId,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      starting_balance: startingBalance,
      current_balance: startingBalance,
      // Initialize current balance to starting balance
      open: true
      // New events are open by default
    }).select().single();
    if (error) {
      return { event: null, error };
    }
    return { event: data, error: null };
  } catch (e) {
    return {
      event: null,
      error: e instanceof Error ? e : new Error("Unknown error creating event")
    };
  }
}
async function getEvent(eventId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("suggestion_events").select("*").eq("id", eventId).single();
    if (error) {
      return { event: null, error };
    }
    return { event: data, error: null };
  } catch (e) {
    return {
      event: null,
      error: e instanceof Error ? e : new Error("Unknown error fetching event")
    };
  }
}
async function updateStartingBalance(eventId, startingBalance) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("suggestion_events").update({
      starting_balance: startingBalance
    }).eq("id", eventId);
    if (error) {
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error("Unknown error updating starting balance")
    };
  }
}
async function closeEvent(eventId) {
  try {
    console.log("closeEvent: Starting to close event with ID:", eventId);
    const supabase = getSupabaseClient();
    const { data: eventExists, error: checkError } = await supabase.from("suggestion_events").select("id, open").eq("id", eventId).maybeSingle();
    if (checkError) {
      console.error("closeEvent: Error checking if event exists:", checkError);
      return { success: false, error: checkError };
    }
    if (!eventExists) {
      console.error("closeEvent: Event does not exist:", eventId);
      return { success: false, error: new Error("Event not found") };
    }
    console.log("closeEvent: Event found, current open status:", eventExists.open);
    const { data, error } = await supabase.from("suggestion_events").update({ open: false }).eq("id", eventId).select("id, open");
    if (error) {
      console.error("closeEvent: Error updating event:", error);
      return { success: false, error };
    }
    console.log("closeEvent: Update result - data:", data);
    if (!data || data.length === 0) {
      console.error("closeEvent: No rows were updated - this suggests a permission or constraint issue");
      return { success: false, error: new Error("No rows were updated - check database permissions") };
    }
    const { data: verifyData, error: verifyError } = await supabase.from("suggestion_events").select("id, open").eq("id", eventId).single();
    if (verifyError) {
      console.error("closeEvent: Error verifying update:", verifyError);
      return { success: false, error: verifyError };
    }
    console.log("closeEvent: Verification - event status after update:", verifyData);
    if (verifyData.open !== false) {
      console.error("closeEvent: Update did not persist - database shows open:", verifyData.open);
      return { success: false, error: new Error("Update did not persist in database") };
    }
    console.log("closeEvent: Event successfully closed and verified in database");
    return { success: true, error: null };
  } catch (e) {
    console.error("closeEvent: Exception occurred:", e);
    return {
      success: false,
      error: e instanceof Error ? e : new Error("Unknown error closing event")
    };
  }
}
async function updateCurrentBalance(eventId, currentBalance) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("suggestion_events").update({
      current_balance: currentBalance
    }).eq("id", eventId);
    if (error) {
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error("Unknown error updating current balance")
    };
  }
}
async function getFirstOpenEventId() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("suggestion_events").select("id").eq("open", true).order("date", { ascending: false }).limit(1).single();
    if (error) {
      console.log("Error fetching first open event:", error);
      return { eventId: null, error };
    }
    if (!data) {
      return {
        eventId: null,
        error: new Error("No open events found")
      };
    }
    return { eventId: data.id, error: null };
  } catch (e) {
    return {
      eventId: null,
      error: e instanceof Error ? e : new Error("Unknown error fetching open event ID")
    };
  }
}

export { closeEvent as a, getEvent as b, createEvent as c, updateStartingBalance as d, fetchEvents as f, getFirstOpenEventId as g, updateCurrentBalance as u };
