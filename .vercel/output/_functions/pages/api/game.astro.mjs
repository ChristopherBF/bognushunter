import { a as addSuggestion } from '../../chunks/suggestionService_DakLVKUk.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const eventId = body.eventId;
    console.log("Server API received request with params:", body);
    if (!body.search || body.search.trim() === "") {
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
            "Content-Type": "application/json"
          }
        }
      );
    }
    const response = await fetch("https://500.casino/api/casino/games?", {
      method: "POST",
      body: JSON.stringify({
        search: body.search,
        page: body.page || 1,
        perPage: body.perPage || 1
      }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      console.error("API responded with error status:", response.status);
      return new Response(
        JSON.stringify({
          error: `API responded with status: ${response.status}`,
          result: null
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const data = await response.json();
    console.log("API Response received successfully", data);
    let suggestionResult = null;
    if (body.eventId && data.results && data.results[0]) {
      try {
        const game = data.results[0];
        suggestionResult = await addSuggestion(
          eventId,
          game.name || game.title || game.id || "Unknown Game",
          body.userId,
          game.custom_thumb || game.url_thumb || game.thumb || game.icon || null,
          game.url_background || game.background || null
        );
      } catch (err) {
        console.error("Failed to add suggestion:", err);
      }
    }
    return new Response(
      JSON.stringify({
        result: data.results[0],
        suggestion: suggestionResult
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in games API endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch games",
        result: null
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
