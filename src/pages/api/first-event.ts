import type { APIRoute } from "astro";
import { getFirstOpenEventId } from "../../services/eventService";

export const GET: APIRoute = async ({ request }) => {
    const { eventId, error } = await getFirstOpenEventId();
    
    if (error) {
      return new Response(JSON.stringify({ eventId: null, error }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ eventId }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
}
    