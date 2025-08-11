import type { APIRoute } from 'astro';
import { fetchHuntList } from '../../../services/huntItemService.ts';

export const GET: APIRoute = async ({ params }) => {
  const { eventId } = params;
  
  console.log('[API] Hunt items API called with eventId:', eventId);

  if (!eventId) {
    console.log('[API] No eventId provided');
    return new Response(JSON.stringify({ error: 'Event ID is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    console.log('[API] Fetching hunt list for eventId:', eventId);
    const { huntItems, error } = await fetchHuntList(eventId);
    console.log('[API] Hunt list result:', { huntItemsCount: huntItems?.length, error });

    if (error) {
      console.error('Error fetching hunt items:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch hunt items' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ huntItems }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error('Exception in hunt items API:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
