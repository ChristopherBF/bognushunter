/* empty css                                 */
import { e as createAstro, f as createComponent, k as renderComponent, n as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CjfJncYZ.mjs';
import 'kleur/colors';
import { g as getCurrentUser, $ as $$Layout } from '../chunks/Layout_D8JOSVxy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://ChristopherBF.github.io");
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const user = await getCurrentUser(Astro2.cookies);
  if (user) {
    return Astro2.redirect("/bognushunter");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-md mx-auto my-10 bg-brown text-gold p-8 rounded-lg shadow-md"> <div class="bg-white p-8 rounded-lg shadow-md"> <h1 class="text-2xl font-bold mb-6 text-center">Login Required</h1> <p class="mb-6 text-gray-600">
Please sign in with your Twitch account to access the suggestion app.
</p> <button id="twitch-login-button" class="w-full py-3 px-4 bg-orange text-gold rounded-md flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"> <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.731v6.806h-2.149v-6.806h2.149zm-5.731 0v6.806h-2.149v-6.806h2.149z"></path> </svg>
Login with Twitch
</button> </div> </div> ` })} ${renderScript($$result, "C:/Users/Christopher/dev/bognushunter/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Christopher/dev/bognushunter/src/pages/login.astro", void 0);

const $$file = "C:/Users/Christopher/dev/bognushunter/src/pages/login.astro";
const $$url = "/bognushunter/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
