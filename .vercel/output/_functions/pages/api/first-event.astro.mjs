import { g as getFirstOpenEventId } from '../../chunks/eventService_CGQAPXL2.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const { eventId, error } = await getFirstOpenEventId();
  if (error) {
    return new Response(JSON.stringify({ eventId: null, error }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
  return new Response(JSON.stringify({ eventId }), {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
