import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';
import { a as addSuggestion } from './suggestionService_DakLVKUk.mjs';
import { g as getFirstOpenEventId } from './eventService_CGQAPXL2.mjs';

async function fetchHuntList(eventId) {
  try {
    const supabase = getSupabaseClient();
    const { data: huntItemsData, error: huntItemsError } = await supabase.from("hunt_items").select("*").eq("event_id", eventId);
    if (huntItemsError) {
      return { huntItems: [], error: huntItemsError };
    }
    if (huntItemsData && huntItemsData.length > 0) {
      const suggestionIds = huntItemsData.map((item) => item.suggestion_id);
      const { data: suggestionsData, error: suggestionsError } = await supabase.from("suggestions").select("id, item").in("id", suggestionIds);
      if (suggestionsError) {
        return { huntItems: [], error: suggestionsError };
      }
      const suggestionMap = /* @__PURE__ */ new Map();
      suggestionsData?.forEach((suggestion) => {
        suggestionMap.set(suggestion.id, suggestion.item);
      });
      const huntItems = huntItemsData.map((huntItem) => ({
        ...huntItem,
        item: suggestionMap.get(huntItem.suggestion_id) || "Unknown item"
      }));
      return { huntItems, error: null };
    } else {
      return { huntItems: [], error: null };
    }
  } catch (e) {
    return {
      huntItems: [],
      error: e instanceof Error ? e : new Error("Unknown error fetching hunt list")
    };
  }
}
async function addToHunt(eventId, suggestion) {
  try {
    const supabase = getSupabaseClient();
    const { data: existingItems, error: fetchError } = await supabase.from("hunt_items").select("suggestion_id").eq("event_id", eventId);
    if (fetchError) {
      return { huntItem: null, error: fetchError, exists: false };
    }
    const itemExists = existingItems.some((item) => item.suggestion_id === suggestion.id);
    if (itemExists) {
      return { huntItem: null, error: null, exists: true };
    }
    const { data, error } = await supabase.from("hunt_items").insert({
      event_id: eventId,
      suggestion_id: suggestion.id,
      wager: 1,
      result: 0,
      bonus: false,
      super_bonus: false,
      completed: false,
      active: true,
      // New hunt items are active by default
      custom_thumb: suggestion.custom_thumb || null,
      url_background: suggestion.url_background || null
    }).select().single();
    if (error) {
      return { huntItem: null, error, exists: false };
    }
    return { huntItem: data, error: null, exists: false };
  } catch (e) {
    return {
      huntItem: null,
      error: e instanceof Error ? e : new Error("Unknown error adding to hunt list"),
      exists: false
    };
  }
}
async function removeFromHunt(id) {
  try {
    const supabase = getSupabaseClient();
    const { data: itemToDelete, error: fetchError } = await supabase.from("hunt_items").select("*").eq("id", id).single();
    if (fetchError) {
      return { success: false, error: fetchError, data: null };
    }
    const { error, data } = await supabase.from("hunt_items").delete().eq("id", id).select();
    if (error) {
      return { success: false, error, data: null };
    }
    return { success: true, error: null, data };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error("Unknown error removing from hunt list"),
      data: null
    };
  }
}
async function updateHuntItem(item) {
  try {
    const supabase = getSupabaseClient();
    console.log("Updating hunt item with ID:", item.id);
    const updateData = {};
    updateData.wager = item.wager;
    updateData.result = item.result;
    updateData.bonus = item.bonus;
    updateData.super_bonus = item.super_bonus;
    updateData.completed = item.completed;
    updateData.active = item.active;
    if (item.custom_thumb) updateData.custom_thumb = item.custom_thumb;
    if (item.url_background) updateData.url_background = item.url_background;
    console.log("Update data:", updateData);
    const { data, error } = await supabase.from("hunt_items").update(updateData).eq("id", item.id).eq("event_id", item.event_id).eq("suggestion_id", item.suggestion_id).select();
    if (error) {
      console.error("Error updating hunt item:", error);
      return { huntItem: null, error };
    }
    console.log("Update result:", data);
    if (!data || data.length === 0) {
      const { data: existingItem, error: fetchError } = await supabase.from("hunt_items").select("*").eq("id", item.id).maybeSingle();
      if (fetchError) {
        console.error("Error fetching hunt item after failed update:", fetchError);
        return {
          huntItem: null,
          error: new Error(`Failed to update hunt item: ${fetchError.message}`)
        };
      }
      if (!existingItem) {
        console.error("Hunt item not found during update verification:", item.id);
        return {
          huntItem: null,
          error: new Error(`Hunt item with ID ${item.id} not found. It may have been deleted.`)
        };
      }
      console.error("Item exists but could not be updated:", existingItem);
      return {
        huntItem: null,
        error: new Error(`Hunt item exists but could not be updated. Check permissions or constraints.`)
      };
    }
    return { huntItem: data[0], error: null };
  } catch (e) {
    console.error("Exception in updateHuntItem:", e);
    return {
      huntItem: null,
      error: e instanceof Error ? e : new Error("Unknown error updating hunt item")
    };
  }
}
async function addGameToHunt(eventId, gameName, userId, customThumb, urlBackground) {
  try {
    let finalEventId = eventId;
    if (!eventId) {
      const { eventId: firstOpenEventId, error: eventError } = await getFirstOpenEventId();
      if (eventError || !firstOpenEventId) {
        return {
          huntItem: null,
          error: new Error("No open events available. Please create an event first."),
          exists: false
        };
      }
      finalEventId = firstOpenEventId;
    }
    const { suggestion, error: suggestionError } = await addSuggestion(
      finalEventId,
      gameName,
      userId,
      customThumb,
      urlBackground
    );
    if (suggestionError || !suggestion) {
      return {
        huntItem: null,
        error: suggestionError || new Error("Failed to create suggestion"),
        exists: false
      };
    }
    const { huntItem, error: huntError, exists } = await addToHunt(finalEventId, suggestion);
    if (huntError) {
      return { huntItem: null, error: huntError, exists };
    }
    return { huntItem, error: null, exists };
  } catch (e) {
    return {
      huntItem: null,
      error: e instanceof Error ? e : new Error("Unknown error adding game to hunt list"),
      exists: false
    };
  }
}

export { addGameToHunt as a, addToHunt as b, fetchHuntList as f, removeFromHunt as r, updateHuntItem as u };
