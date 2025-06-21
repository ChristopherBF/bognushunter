import { getSupabaseClient } from '../lib/supabase';
import type { Suggestion } from './suggestionService';

/**
 * Service for handling hunt item-related operations with Supabase
 */
import type { HuntItem } from '../types/hunt';

/**
 * Fetch the hunt list for a specific event
 * @param eventId The ID of the event to fetch the hunt list for
 * @returns Array of hunt items with suggestion data
 */
export async function fetchHuntList(eventId: string): Promise<{ 
  huntItems: HuntItem[], 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    // First fetch hunt items without joins
    const { data: huntItemsData, error: huntItemsError } = await supabase
      .from('hunt_items')
      .select('*') // 'active' will be included if present in the table
      .eq('event_id', eventId);

    if (huntItemsError) {
      return { huntItems: [], error: huntItemsError };
    }

    // Then fetch the related suggestions separately
    if (huntItemsData && huntItemsData.length > 0) {
      const suggestionIds = huntItemsData.map(item => item.suggestion_id);
      
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('id, item')
        .in('id', suggestionIds);
        
      if (suggestionsError) {
        return { huntItems: [], error: suggestionsError };
      }
      
      // Create a map of suggestion id to item text
      const suggestionMap = new Map();
      suggestionsData?.forEach(suggestion => {
        suggestionMap.set(suggestion.id, suggestion.item);
      });
      
      // Join the data manually
      const huntItems = huntItemsData.map(huntItem => ({
        ...huntItem,
        item: suggestionMap.get(huntItem.suggestion_id) || 'Unknown item'
      }));
      
      return { huntItems, error: null };
    } else {
      return { huntItems: [], error: null };
    }
  } catch (e) {
    return { 
      huntItems: [], 
      error: e instanceof Error ? e : new Error('Unknown error fetching hunt list') 
    };
  }
}

/**
 * Add a suggestion to the hunt list
 * @param eventId The ID of the event
 * @param suggestion The suggestion to add to the hunt list
 * @returns The added hunt item and any error
 */
export async function addToHunt(
  eventId: string, 
  suggestion: Suggestion
): Promise<{ huntItem: HuntItem | null, error: Error | null, exists: boolean }> {
  try {
    const supabase = getSupabaseClient();
    
    // Check if this item already exists in the hunt list
    const { data: existingItems, error: fetchError } = await supabase
      .from('hunt_items')
      .select('suggestion_id')
      .eq('event_id', eventId);
      
    if (fetchError) {
      return { huntItem: null, error: fetchError, exists: false };
    }
    
    // Check if the suggestion is already in the hunt list
    const itemExists = existingItems.some(item => item.suggestion_id === suggestion.id);
    
    if (itemExists) {
      return { huntItem: null, error: null, exists: true };
    }
    
    // Create the hunt item with thumbnail and background URLs
    const { data, error } = await supabase
      .from('hunt_items')
      .insert({
        event_id: eventId,
        suggestion_id: suggestion.id,
        wager: 1,
        result: 0,
        bonus: false,
        super_bonus: false,
        completed: false,
        active: true, // New hunt items are active by default
        custom_thumb: suggestion.custom_thumb || null,
        url_background: suggestion.url_background || null
      })
      .select()
      .single();

    if (error) {
      return { huntItem: null, error, exists: false };
    }
    
    return { huntItem: data, error: null, exists: false };
  } catch (e) {
    return { 
      huntItem: null, 
      error: e instanceof Error ? e : new Error('Unknown error adding to hunt list'), 
      exists: false 
    };
  }
}

/**
 * Remove an item from the hunt list
 * @param id The ID of the hunt item to remove
 * @returns Success status and any error
 */
export async function removeFromHunt(id: string): Promise<{ 
  success: boolean, 
  error: Error | null,
  data: any | null
}> {
  try {
    const supabase = getSupabaseClient();
    
    // First, try to get the item to confirm it exists
    const { data: itemToDelete, error: fetchError } = await supabase
      .from('hunt_items')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      return { success: false, error: fetchError, data: null };
    }
    
    // Perform the deletion
    const { error, data } = await supabase
      .from('hunt_items')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return { success: false, error, data: null };
    }
    
    return { success: true, error: null, data };
  } catch (e) {
    return { 
      success: false, 
      error: e instanceof Error ? e : new Error('Unknown error removing from hunt list'),
      data: null
    };
  }
}

/**
 * Update a hunt item
 * @param item The hunt item to update
 * @returns The updated hunt item and any error
 */
export async function updateHuntItem(item: HuntItem): Promise<{ 
  huntItem: HuntItem | null, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    console.log('Updating hunt item with ID:', item.id);
    
    // Prepare update data - only include fields that should be updated
    const updateData: Record<string, any> = {};
    
    // Only include fields that we want to update
    // These are the fields that are editable in the UI
    updateData.wager = item.wager;
    updateData.result = item.result;
    updateData.bonus = item.bonus;
    updateData.super_bonus = item.super_bonus;
    updateData.completed = item.completed;
    updateData.active = item.active; // Allow toggling active status
    
    // Only include these if they're not null/undefined
    if (item.custom_thumb) updateData.custom_thumb = item.custom_thumb;
    if (item.url_background) updateData.url_background = item.url_background;
    
    console.log('Update data:', updateData);
    
    // Try to directly update without checking existence first
    // This is more efficient and avoids race conditions
    const { data, error } = await supabase
      .from('hunt_items')
      .update(updateData)
      .eq('id', item.id)
      .eq('event_id', item.event_id) // Additional safety check
      .eq('suggestion_id', item.suggestion_id) // Additional safety check
      .select();
      
    if (error) {
      console.error('Error updating hunt item:', error);
      return { huntItem: null, error };
    }
    
    console.log('Update result:', data);
    
    if (!data || data.length === 0) {
      // If no rows were updated, try to fetch the item to see if it exists
      const { data: existingItem, error: fetchError } = await supabase
        .from('hunt_items')
        .select('*')
        .eq('id', item.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching hunt item after failed update:', fetchError);
        return { 
          huntItem: null, 
          error: new Error(`Failed to update hunt item: ${fetchError.message}`) 
        };
      }
      
      if (!existingItem) {
        console.error('Hunt item not found during update verification:', item.id);
        return { 
          huntItem: null, 
          error: new Error(`Hunt item with ID ${item.id} not found. It may have been deleted.`) 
        };
      }
      
      // Item exists but couldn't be updated - might be a permission issue or constraint violation
      console.error('Item exists but could not be updated:', existingItem);
      return { 
        huntItem: null, 
        error: new Error(`Hunt item exists but could not be updated. Check permissions or constraints.`) 
      };
    }
    
    // Return the first item from the data array
    return { huntItem: data[0], error: null };
  } catch (e) {
    console.error('Exception in updateHuntItem:', e);
    return { 
      huntItem: null, 
      error: e instanceof Error ? e : new Error('Unknown error updating hunt item') 
    };
  }
}
