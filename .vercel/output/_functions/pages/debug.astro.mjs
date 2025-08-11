/* empty css                                 */
import { f as createComponent, k as renderComponent, n as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_D8JOSVxy.mjs';
import { s as supabase } from '../chunks/supabase_CHjbA2D-.mjs';
export { renderers } from '../renderers.mjs';

const $$Debug = createComponent(async ($$result, $$props, $$slots) => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { data } = await supabase.auth.getUser();
  const userData = data?.user;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Debug Authentication" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-brown text-gold min-h-screen"> <div class="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg shadow"> <h1 class="text-2xl font-bold mb-6">Authentication Debug</h1> <div class="mb-6"> <h2 class="text-xl font-semibold mb-2">Session Information</h2> <pre class="bg-gray-100 p-4 rounded overflow-auto">          ${JSON.stringify(session, null, 2)}
        </pre> </div> <div class="mb-6"> <h2 class="text-xl font-semibold mb-2">User Information</h2> <pre class="bg-gray-100 p-4 rounded overflow-auto">          ${JSON.stringify(user, null, 2)}
        </pre> </div> ${JSON.stringify(session, null, 2)} </div> <div class="mb-6"> <h2 class="text-xl font-semibold mb-2">User Information</h2> <pre class="bg-gray-100 p-4 rounded overflow-auto">        ${JSON.stringify(user, null, 2)}
      </pre> </div> <div class="mb-6"> <h2 class="text-xl font-semibold mb-2">User Data (Alternative Method)</h2> <pre class="bg-gray-100 p-4 rounded overflow-auto">        ${JSON.stringify(userData, null, 2)}
      </pre> </div> <div class="mt-8 flex space-x-4"> <a href="/" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
Go to Home
</a> <button id="check-auth-btn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
Check Auth State
</button> <button id="sign-out-btn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
Sign Out
</button> </div> </div> ` })} ${renderScript($$result, "C:/Users/Christopher/dev/bognushunter/src/pages/debug.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/debug.astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/debug.astro";
const $$url = "/bognushunter/debug";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Debug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
