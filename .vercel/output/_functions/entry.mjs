import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DT4fAjHk.mjs';
import { manifest } from './manifest_DrNbW3Sn.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/first-event.astro.mjs');
const _page3 = () => import('./pages/api/game.astro.mjs');
const _page4 = () => import('./pages/api/games.astro.mjs');
const _page5 = () => import('./pages/api/hunt-items/_eventid_.astro.mjs');
const _page6 = () => import('./pages/callback.astro.mjs');
const _page7 = () => import('./pages/debug.astro.mjs');
const _page8 = () => import('./pages/huntlist/_eventid_.astro.mjs');
const _page9 = () => import('./pages/login.astro.mjs');
const _page10 = () => import('./pages/stream/_eventid_.astro.mjs');
const _page11 = () => import('./pages/suggest/_eventid_.astro.mjs');
const _page12 = () => import('./pages/suggestions/_eventid_.astro.mjs');
const _page13 = () => import('./pages/suggestions.astro.mjs');
const _page14 = () => import('./pages/summary/_eventid_.astro.mjs');
const _page15 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/first-event.ts", _page2],
    ["src/pages/api/game.ts", _page3],
    ["src/pages/api/games.ts", _page4],
    ["src/pages/api/hunt-items/[eventId].ts", _page5],
    ["src/pages/callback.astro", _page6],
    ["src/pages/debug.astro", _page7],
    ["src/pages/huntlist/[eventId].astro", _page8],
    ["src/pages/login.astro", _page9],
    ["src/pages/stream/[eventId].astro", _page10],
    ["src/pages/suggest/[eventId].astro", _page11],
    ["src/pages/suggestions/[eventId].astro", _page12],
    ["src/pages/suggestions.astro", _page13],
    ["src/pages/summary/[eventId].astro", _page14],
    ["src/pages/index.astro", _page15]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "1e845c21-38a5-4d77-b1d4-d809e91c33e2",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
