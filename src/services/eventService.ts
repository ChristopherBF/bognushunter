import { getSupabaseClient } from '../lib/supabase.ts';
import type { Event } from '../types/event.ts';

/**
 * Service for handling event-related operations with Supabase
 */


/**
 * Fetch all events for a specific user
 * @param userId The ID of the user to fetch events for
 * @returns Array of events
 */
export async function fetchEvents(userId: string): Promise<{ 
  events: Event[], 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch events created by this user
    const { data, error } = await supabase
      .from('suggestion_events')
      .select('*') // 'open' will be included if present in the table
      .eq('created_by', userId)
      .order('date', { ascending: false });
      
    if (error) {
      return { events: [], error };
    }
    
    // Fetch suggestion counts for each event
    const events = await Promise.all(data.map(async (event) => {
      // Get suggestion count
      const { count: suggestionsCount, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
        
      // Get hunt items count
      const { count: huntItemsCount, error: huntItemsError } = await supabase
        .from('hunt_items')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
        
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
      error: e instanceof Error ? e : new Error('Unknown error fetching events') 
    };
  }
}

/**
 * Create a new event
 * @param name The name of the event
 * @param userId The ID of the user creating the event
 * @param startingBalance The starting balance for the event
 * @returns The created event and any error
 */
export async function createEvent(name: string, userId: string, startingBalance: number = 1000): Promise<{ 
  event: Event | null, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('suggestion_events')
      .insert({
        created_by: userId,
        date: new Date().toISOString(),
        starting_balance: startingBalance,
        current_balance: startingBalance, // Initialize current balance to starting balance
        open: true // New events are open by default
      })
      .select()
      .single();
      
    if (error) {
      return { event: null, error };
    }
    
    return { event: data, error: null };
  } catch (e) {
    return { 
      event: null, 
      error: e instanceof Error ? e : new Error('Unknown error creating event') 
    };
  }
}

/**
 * Get an event by ID
 * @param eventId The ID of the event to fetch
 * @returns The event and any error
 */
export async function getEvent(eventId: string): Promise<{ 
  event: Event | null, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('suggestion_events')
      .select('*') // 'open' included
      .eq('id', eventId)
      .single();
      
    if (error) {
      return { event: null, error };
    }
    
    return { event: data, error: null };
  } catch (e) {
    return { 
      event: null, 
      error: e instanceof Error ? e : new Error('Unknown error fetching event') 
    };
  }
}

/**
 * Update the starting balance for an event
 * @param eventId The ID of the event to update
 * @param startingBalance The new starting balance value
 * @returns Success status and any error
 */
export async function updateStartingBalance(
  eventId: string,
  startingBalance: number
): Promise<{ 
  success: boolean, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('suggestion_events')
      .update({
        starting_balance: startingBalance
      })
      .eq('id', eventId);
      
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (e) {
    return { 
      success: false, 
      error: e instanceof Error ? e : new Error('Unknown error updating starting balance') 
    };
  }
}

/**
 * Update the current balance for an event
 * @param eventId The ID of the event to update
 * @param currentBalance The new current balance value
 * @returns Success status and any error
 */
/**
 * Close a suggestion event (set open = false)
 * @param eventId The ID of the event to close
 * @returns Success status and any error
 */
export async function closeEvent(eventId: string): Promise<{ success: boolean, error: Error | null }> {
  try {
    console.log('closeEvent: Starting to close event with ID:', eventId);
    const supabase = getSupabaseClient();
    
    // First, verify the event exists
    const { data: eventExists, error: checkError } = await supabase
      .from('suggestion_events')
      .select('id, open')
      .eq('id', eventId)
      .maybeSingle();
      
    if (checkError) {
      console.error('closeEvent: Error checking if event exists:', checkError);
      return { success: false, error: checkError };
    }
    
    if (!eventExists) {
      console.error('closeEvent: Event does not exist:', eventId);
      return { success: false, error: new Error('Event not found') };
    }
    
    console.log('closeEvent: Event found, current open status:', eventExists.open);
    
    // Update the event to close it
    const { data, error } = await supabase
      .from('suggestion_events')
      .update({ open: false })
      .eq('id', eventId)
      .select('id, open'); // Return the updated data to verify the change
      
    if (error) {
      console.error('closeEvent: Error updating event:', error);
      return { success: false, error };
    }
    
    console.log('closeEvent: Update result - data:', data);
    
    // Verify the update actually happened by checking if data is returned
    if (!data || data.length === 0) {
      console.error('closeEvent: No rows were updated - this suggests a permission or constraint issue');
      return { success: false, error: new Error('No rows were updated - check database permissions') };
    }
    
    // Double-check by reading the event back from the database
    const { data: verifyData, error: verifyError } = await supabase
      .from('suggestion_events')
      .select('id, open')
      .eq('id', eventId)
      .single();
      
    if (verifyError) {
      console.error('closeEvent: Error verifying update:', verifyError);
      return { success: false, error: verifyError };
    }
    
    console.log('closeEvent: Verification - event status after update:', verifyData);
    
    if (verifyData.open !== false) {
      console.error('closeEvent: Update did not persist - database shows open:', verifyData.open);
      return { success: false, error: new Error('Update did not persist in database') };
    }
    
    console.log('closeEvent: Event successfully closed and verified in database');
    return { success: true, error: null };
  } catch (e) {
    console.error('closeEvent: Exception occurred:', e);
    return {
      success: false,
      error: e instanceof Error ? e : new Error('Unknown error closing event')
    };
  }
}

export async function updateCurrentBalance(
  eventId: string,
  currentBalance: number | null
): Promise<{ 
  success: boolean, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('suggestion_events')
      .update({
        current_balance: currentBalance
      })
      .eq('id', eventId);
      
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (e) {
    return { 
      success: false, 
      error: e instanceof Error ? e : new Error('Unknown error updating current balance') 
    };
  }
}

/**
 * Get the ID of the first open event
 * @returns The ID of the first open event, or null if no open events exist
 */
export async function getFirstOpenEventId(): Promise<{ 
  eventId: string | null, 
  error: Error | null 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('suggestion_events')
      .select('id')
      .eq('open', true)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log('Error fetching first open event:', error);
      return { eventId: null, error };
    }

    if (!data) {
      return { 
        eventId: null, 
        error: new Error('No open events found') 
      };
    }
    
    return { eventId: data.id, error: null };
  } catch (e) {
    return { 
      eventId: null, 
      error: e instanceof Error ? e : new Error('Unknown error fetching open event ID') 
    };
  }
}
