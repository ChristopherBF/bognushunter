import type { APIRoute } from 'astro';
import { addSuggestion } from '../../services/suggestionService.ts';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get the request body from the client
    const body = await request.json();
    const eventId = body.eventId;
    
    console.log('Server API received request with params:', body);
    
    // Don't make a request if search term is empty
    if (!body.search || body.search.trim() === '') {
      return new Response(
        JSON.stringify({
          results: [],
          pagination: {
            totalEntries: 0,
            hasPrev: false,
            hasNext: false
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Forward the request to the actual API
    const response = await fetch('https://500.casino/api/casino/games?', {
      method: 'POST',
      body: JSON.stringify({
        search: body.search,
        page: body.page || 1,
        perPage: body.perPage || 1
      }),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      }
    });
    
    // Check if the request was successful
    if (!response.ok) {
      console.error('API responded with error status:', response.status);
      return new Response(
        JSON.stringify({
          error: `API responded with status: ${response.status}`,
          result: null
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Get the response data
    const data = await response.json();
    console.log('API Response received successfully', data);

    // Add the found game as a suggestion for the event if eventId and userId are provided
    let suggestionResult = null;
    if (body.eventId && data.results && data.results[0]) {
      try {
        const game = data.results[0];
        suggestionResult = await addSuggestion(
          eventId,
          game.name || game.title || game.id || 'Unknown Game',
          body.userId,
          game.custom_thumb || game.url_thumb || game.thumb || game.icon || null,
          game.url_background || game.background || null
        );
      } catch (err) {
        console.error('Failed to add suggestion:', err);
      }
    }

    // Return the response to the client
    return new Response(
      JSON.stringify({
        result: data.results[0],
        suggestion: suggestionResult
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in games API endpoint:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch games',
        result: null
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
