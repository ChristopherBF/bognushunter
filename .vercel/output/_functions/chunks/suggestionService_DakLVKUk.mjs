import { g as getSupabaseClient } from './supabase_CHjbA2D-.mjs';
import { g as getFirstOpenEventId } from './eventService_CGQAPXL2.mjs';

async function fetchSuggestions(eventId) {
  try {
    const supabase = getSupabaseClient();
    const { data: rawSuggestions, error: suggestionError } = await supabase.from("suggestions").select("id, item, user_id, created_at, event_id, custom_thumb, url_background").eq("event_id", eventId);
    if (suggestionError) {
      return { suggestions: [], error: suggestionError };
    }
    const suggestionCounts = /* @__PURE__ */ new Map();
    const suggestionIds = /* @__PURE__ */ new Map();
    const suggestionThumbs = /* @__PURE__ */ new Map();
    const suggestionBackgrounds = /* @__PURE__ */ new Map();
    rawSuggestions?.forEach((suggestion) => {
      const item = suggestion.item;
      const count = suggestionCounts.get(item) || 0;
      if (!suggestionIds.has(item)) {
        suggestionIds.set(item, suggestion.id);
        if (suggestion.custom_thumb) {
          suggestionThumbs.set(item, suggestion.custom_thumb);
        }
        if (suggestion.url_background) {
          suggestionBackgrounds.set(item, suggestion.url_background);
        }
      }
      suggestionCounts.set(item, count + 1);
    });
    const originalSuggestions = /* @__PURE__ */ new Map();
    rawSuggestions?.forEach((suggestion) => {
      if (!originalSuggestions.has(suggestion.item) && suggestionIds.get(suggestion.item) === suggestion.id) {
        originalSuggestions.set(suggestion.item, suggestion);
      }
    });
    const processedSuggestions = Array.from(suggestionCounts.entries()).map(([item, count]) => {
      const originalSuggestion = originalSuggestions.get(item) || {};
      return {
        // Keep the original suggestion ID
        id: suggestionIds.get(item),
        // Keep the original suggestion object properties
        ...originalSuggestion,
        // Override with aggregated data
        item,
        count,
        event_id: eventId,
        // Use stored thumbnail and background if available
        custom_thumb: suggestionThumbs.get(item) || null,
        url_background: suggestionBackgrounds.get(item) || null,
        url_thumb: null,
        provider: ""
      };
    });
    processedSuggestions.sort((a, b) => b.count - a.count);
    return { suggestions: processedSuggestions, error: null };
  } catch (e) {
    return { suggestions: [], error: e instanceof Error ? e : new Error("Unknown error fetching suggestions") };
  }
}
async function saveCustomThumb(suggestionId, thumbUrl, backgroundUrl = null) {
  try {
    const supabase = getSupabaseClient();
    const updateData = { custom_thumb: thumbUrl };
    if (backgroundUrl) {
      updateData.url_background = backgroundUrl;
    }
    const { error } = await supabase.from("suggestions").update(updateData).eq("id", suggestionId);
    if (error) {
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error("Unknown error saving custom thumbnail")
    };
  }
}
async function fetchGameDataForSuggestions(suggestions, baseUrl) {
  try {
    const updatedSuggestions = [...suggestions];
    for (const suggestion of updatedSuggestions) {
      if (suggestion.custom_thumb) {
        continue;
      }
      const response = await fetch(`${baseUrl || "/"}api/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          search: suggestion.item,
          page: 1,
          perPage: 1
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.games && data.games.length > 0) {
          const exactMatch = data.games.find(
            (g) => g.name.toLowerCase() === suggestion.item.toLowerCase()
          );
          const game = exactMatch || data.games[0];
          suggestion.custom_thumb = game.custom_thumb || game.url_thumb;
          suggestion.url_background = game.url_background || null;
          suggestion.provider = game.provider;
          await saveCustomThumb(suggestion.id, suggestion.custom_thumb, suggestion.url_background);
        }
      }
    }
    return { updatedSuggestions, error: null };
  } catch (e) {
    return {
      updatedSuggestions: suggestions,
      error: e instanceof Error ? e : new Error("Error fetching game data for suggestions")
    };
  }
}
async function addSuggestion(eventId, item, userId, custom_thumb, url_background) {
  try {
    const supabase = getSupabaseClient();
    console.log(
      "Adding suggestion:",
      eventId,
      item,
      userId
    );
    let finalEventId = eventId;
    if (!eventId) {
      console.log("No eventId provided, fetching first open event");
      const { eventId: firstOpenEventId, error: eventError } = await getFirstOpenEventId();
      if (eventError || !firstOpenEventId) {
        return {
          suggestion: null,
          error: new Error("No open events available. Please create an event first.")
        };
      }
      finalEventId = firstOpenEventId;
      console.log("Using first open event:", finalEventId);
    } else {
      const { data: eventExists, error: checkError } = await supabase.from("suggestion_events").select("id, open").eq("id", eventId).eq("open", true).maybeSingle();
      if (checkError || !eventExists) {
        console.log("Provided eventId does not exist or is closed, fetching first open event");
        const { eventId: firstOpenEventId, error: eventError } = await getFirstOpenEventId();
        if (eventError || !firstOpenEventId) {
          return {
            suggestion: null,
            error: new Error("No open events available. Please create an event first.")
          };
        }
        finalEventId = firstOpenEventId;
        console.log("Using first open event instead:", finalEventId);
      }
    }
    const { data, error } = await supabase.from("suggestions").insert({
      event_id: finalEventId,
      item,
      user_id: userId,
      custom_thumb: custom_thumb || null,
      url_background: url_background || null
    }).select().single();
    if (error) {
      return { suggestion: null, error };
    }
    return { suggestion: data, error: null };
  } catch (e) {
    return {
      suggestion: null,
      error: e instanceof Error ? e : new Error("Unknown error adding suggestion")
    };
  }
}

export { addSuggestion as a, fetchGameDataForSuggestions as b, fetchSuggestions as f, saveCustomThumb as s };
