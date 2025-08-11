export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
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
        perPage: body.perPage || 36
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
            "Content-Type": "application/json"
          }
        }
      );
    }
    const data = await response.json();
    console.log("API Response received successfully");
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
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in games API endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch games",
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
