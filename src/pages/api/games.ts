import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get the request body from the client
    const body = await request.json();
    
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
        perPage: body.perPage || 36
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
          results: [],
          pagination: {
            totalEntries: 0,
            hasPrev: false,
            hasNext: false
          }
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
    console.log('API Response received successfully');
    
    // Return the response to the client
    return new Response(
      JSON.stringify({
        results: data.results,
        pagination: {
          totalEntries: data.pagination.totalEntries,
          hasPrev: data.pagination.hasPrev,
          hasNext: data.pagination.hasNext
        }
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
        results: [],
        pagination: {
          totalEntries: 0,
          hasPrev: false,
          hasNext: false
        }
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
