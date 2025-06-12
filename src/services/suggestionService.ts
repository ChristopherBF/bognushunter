import { getSupabaseClient } from '../lib/supabase';

/**
 * Service for handling suggestion-related operations with Supabase
 */
export interface Suggestion {
  id: string;
  item: string;
  user_id: string;
  created_at: string;
  event_id: string;
  custom_thumb?: string | null;
  url_background?: string | null;
  count?: number;
  url_thumb?: string | null;
  provider?: string;
}

/**
 * Fetch all suggestions for a specific event
 * @param eventId The ID of the event to fetch suggestions for
 * @returns Array of suggestions with count information
 */
export async function fetchSuggestions(eventId: string): Promise<{ 
  suggestions: Suggestion[], 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    // First fetch all suggestions for this event
    const { data: rawSuggestions, error: suggestionError } = await supabase
      .from('suggestions')
      .select('id, item, user_id, created_at, event_id, custom_thumb, url_background')
      .eq('event_id', eventId);

    if (suggestionError) {
      return { suggestions: [], error: suggestionError };
    }
    
    // Process the raw suggestions to count occurrences of each item
    const suggestionCounts = new Map();
    const suggestionIds = new Map();
    const suggestionThumbs = new Map();
    const suggestionBackgrounds = new Map();
    
    // Count occurrences and keep track of the first ID, thumbnail, and background for each unique item
    rawSuggestions?.forEach(suggestion => {
      const item = suggestion.item;
      const count = suggestionCounts.get(item) || 0;
      
      // Store the first ID we encounter for each unique item
      if (!suggestionIds.has(item)) {
        suggestionIds.set(item, suggestion.id);
        // Store the thumbnail if available
        if (suggestion.custom_thumb) {
          suggestionThumbs.set(item, suggestion.custom_thumb);
        }
        // Store the background if available
        if (suggestion.url_background) {
          suggestionBackgrounds.set(item, suggestion.url_background);
        }
      }
      
      suggestionCounts.set(item, count + 1);
    });
    
    // Find the original suggestion object for each unique item
    const originalSuggestions = new Map();
    rawSuggestions?.forEach(suggestion => {
      if (!originalSuggestions.has(suggestion.item) && suggestionIds.get(suggestion.item) === suggestion.id) {
        originalSuggestions.set(suggestion.item, suggestion);
      }
    });
    
    // Convert to the format expected by the UI
    const processedSuggestions = Array.from(suggestionCounts.entries()).map(([item, count]) => {
      // Get the original suggestion object
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
        provider: ''
      };
    });
    
    // Sort by count in descending order
    processedSuggestions.sort((a, b) => b.count - a.count);
    
    return { suggestions: processedSuggestions, error: null };
  } catch (e) {
    return { suggestions: [], error: e instanceof Error ? e : new Error('Unknown error fetching suggestions') };
  }
}

/**
 * Save custom thumbnail and background URLs for a suggestion
 * @param suggestionId The ID of the suggestion to update
 * @param thumbUrl The thumbnail URL to save
 * @param backgroundUrl Optional background URL to save
 * @returns Success status and any error
 */
export async function saveCustomThumb(
  suggestionId: string, 
  thumbUrl: string, 
  backgroundUrl: string | null = null
): Promise<{ success: boolean, error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    
    const updateData: any = { custom_thumb: thumbUrl };
    if (backgroundUrl) {
      updateData.url_background = backgroundUrl;
    }
    
    const { error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', suggestionId);
      
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (e) {
    return { 
      success: false, 
      error: e instanceof Error ? e : new Error('Unknown error saving custom thumbnail') 
    };
  }
}

/**
 * Fetch game data for suggestions that don't have thumbnails
 * @param suggestions Array of suggestions to fetch game data for
 * @param baseUrl Base URL for API requests
 * @returns Updated suggestions with game data
 */
export async function fetchGameDataForSuggestions(
  suggestions: Suggestion[],
  baseUrl: string
): Promise<{ 
  updatedSuggestions: Suggestion[], 
  error: Error | null 
}> {
  try {
    const updatedSuggestions = [...suggestions];
    
    // Try to fetch game data for each suggestion that doesn't already have a thumbnail
    for (const suggestion of updatedSuggestions) {
      // Skip if we already have a thumbnail
      if (suggestion.custom_thumb) {
        continue;
      }
      
      const response = await fetch(`${baseUrl || '/'}api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          search: suggestion.item,
          page: 1,
          perPage: 1
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.games && data.games.length > 0) {
          // Find the best match
          const exactMatch = data.games.find(g => 
            g.name.toLowerCase() === suggestion.item.toLowerCase()
          );
          const game = exactMatch || data.games[0];
          
          // Update the suggestion with game data
          suggestion.custom_thumb = game.custom_thumb || game.url_thumb;
          suggestion.url_background = game.url_background || null;
          suggestion.provider = game.provider;
          
          // Save the thumbnail and background URLs to the database
          await saveCustomThumb(suggestion.id, suggestion.custom_thumb, suggestion.url_background);
        }
      }
    }
    
    return { updatedSuggestions, error: null };
  } catch (e) {
    return { 
      updatedSuggestions: suggestions, 
      error: e instanceof Error ? e : new Error('Error fetching game data for suggestions')
    };
  }
}

/**
 * Add a new suggestion
 * @param eventId The ID of the event to add the suggestion to
 * @param item The suggestion item text
 * @param userId The ID of the user adding the suggestion
 * @returns The added suggestion and any error
 */
export async function addSuggestion(
  eventId: string,
  item: string,
  userId: string
): Promise<{ suggestion: Suggestion | null, error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        event_id: eventId,
        item,
        user_id: userId
      })
      .select()
      .single();
      
    if (error) {
      return { suggestion: null, error };
    }
    
    return { suggestion: data, error: null };
  } catch (e) {
    return { 
      suggestion: null, 
      error: e instanceof Error ? e : new Error('Unknown error adding suggestion') 
    };
  }
}
