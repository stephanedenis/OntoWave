const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/mermaid-D-rVCKi2.js","assets/rolldown-runtime-FhOqtrmT.js","assets/yaml-oZ9mc5Vo.js","assets/markdown-cjiG2FRR.js","assets/md-DM8L1vVv.js","assets/katex-38ZsmK9X.js"])))=>i.map(i=>d[i]);
import{o as e}from"./rolldown-runtime-FhOqtrmT.js";import{a as t,i as n,n as r,o as i,r as a,t as o}from"./md-DM8L1vVv.js";import{n as s}from"./katex-38ZsmK9X.js";import{H as c}from"./mermaid-D-rVCKi2.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function l(e){let t=e.replace(/\/+/g,`/`).replace(/\/$/,``);return t===``?`/`:t.startsWith(`/`)?t:`/`+t}function u(e,t){let n=[],r=l(t),i=[];for(let t of e){let e=t.base===`/`?`/`:`/`+String(t.base).replace(/^\/+|\/+$/g,``);if(e===`/`||r===e||r.startsWith(e+`/`)){let n=e===`/`?r:r.slice(e.length)||`/`;i.push({r:t,sub:n})}}if(i.length===0)for(let t of e)i.push({r:t,sub:r});for(let{r:e,sub:t}of i){let r=e.root.replace(/\/$/,``),i=r.replace(/\/(?:[a-z]{2})$/i,``)||r,a=t===`/`?`/index`:t,o=String(e.base||``).replace(/^\/+|\/+$/g,``),s=o&&o!==`/`?`.${o}`:``;s&&(n.push(`${r}${a}${s}.md`),n.push(`${r}${t}/index${s}.md`),i!==r&&(n.push(`${i}${a}${s}.md`),n.push(`${i}${t}/index${s}.md`),n.push(`${i}${a}.md`),n.push(`${i}${t}/index.md`))),o&&(n.push(`${r}/${o}${a}.md`),n.push(`${r}/${o}${t}/index.md`)),n.push(`${r}${a}.md`),n.push(`${r}${t}/index.md`)}return n}function d(e,t){let[n]=(t??globalThis.location?.hash??`#/`).toString().split(`?`),r=(n.replace(/^#/,``)||`/`).split(`/`).filter(Boolean),i=/^[a-z]{2}$/.test(r[0]||``)?(r[0]||``).toLowerCase():``,a=r.slice(0,-1),o=e=>{let t=[];for(let n of e)if(!(n===``||n===`.`)){if(n===`..`){t.pop();continue}t.push(n)}return`/`+t.join(`/`)};return e.replace(/href=("|')([^"']+\.md)(#[^"']*)?(\1)/gi,(e,t,n,r=``,s)=>{if(/^(https?:)?\/\//i.test(n))return`href=${t}${n}${r||``}${t}`;if(n.startsWith(`/`))return`href=${t}#${n.replace(/\.md$/i,``)}${r||``}${t}`;if(/^[a-z]{2}\//i.test(n))return`href=${t}#/${n.replace(/\.md$/i,``)}${r||``}${t}`;let c=n.replace(/^\.\//,``);return`href=${t}#${o([...a.length?a:i?[i]:[],...c.replace(/\.md$/i,``).split(`/`)])}${r||``}${t}`})}async function f(e,t,n,r){let i=t.split(`?`)[0],a=r.resolveCandidates(e,i);for(let e of a)try{let t=await n.fetchText(e);if(t!=null)return t}catch{}return`# 404 — Not found\n\nAucun document pour \`${t}\``}function p(e){let t=e.resolver??{resolveCandidates:u},n=e.plugins??[],r=null,i=null;async function a(r){if(!i)return;let a=r??e.router.get().path,[o,s]=a.split(`?`),c=new URLSearchParams(s||``).get(`view`)||``,l=await f(i.roots,o,e.content,t);for(let e of n)l=await e.beforeRender?.(l,a)??l;let u=e.md.render(l),d=c.toLowerCase();if(d===`split`||d===`sbs`){let t=`
        <div style="display:flex; gap:1rem; align-items:flex-start;">
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
            <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${(e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`))(l)}</pre>
          </div>
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Rendu (HTML/SVG)</div>
            <div style="padding:0.75rem;">${u}</div>
          </div>
        </div>`;e.view.setHtml(t)}else if(d===`md`){let t=`
        <div style="border:1px solid #ddd; border-radius:4px; overflow:auto;">
          <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
          <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${(e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`))(l)}</pre>
        </div>`;e.view.setHtml(t)}else e.view.setHtml(u);let p=/<h1[^>]*>(.*?)<\/h1>/i.exec(u)?.[1]?.replace(/<[^>]+>/g,``).trim();p&&e.view.setTitle(`${p} — OntoWave`),await e.enhance?.afterRender(u,a);for(let e of n)await e.afterRender?.(u,a)}async function o(){i=await e.config.load();let t={get config(){return i},navigate:t=>e.router.navigate(t)};for(let e of n)await e.onStart?.(t);await a(),r=e.router.subscribe(async e=>{for(let t of n)await t.onRouteChange?.(e.path);a()})}async function s(){r?.(),r=null;for(let e of n)await e.onStop?.()}return{start:o,stop:s,renderRoute:a}}function m(e){let t=e.replace(/\\/g,`/`).replace(/\/{2,}/g,`/`).replace(/\/$/,``);return t.startsWith(`/`)?t:`/`+t}function h(e){let t=window.__ONTOWAVE_BUNDLE__;if(!t)return null;let n=m(e);return typeof t[n]==`string`?t[n]:null}function g(e){let t=h(e);if(t==null)return null;try{return JSON.parse(t)}catch{return null}}var _={async load(){return g(`/config.json`)||await(await fetch(`/config.json`,{cache:`no-cache`})).json()}},v={async fetchText(e){let t=h(e);if(t!=null)return t;let n=await fetch(e,{cache:`no-cache`}).catch(()=>null);return!n||!n.ok?null:await n.text()}};function y(){let e=location.hash||`#/`,t=e.startsWith(`#`)?e.slice(1):e;return t.startsWith(`/`)||(t=`/`+t),{path:t}}var b={get(){return y()},subscribe(e){let t=()=>e(y());window.addEventListener(`hashchange`,t);let n=e=>{let t=e.target?.closest?.(`a[href]`);if(!t)return;let n=t.getAttribute(`href`)||``;if(n.endsWith(`.md`)&&!/^(https?:)?\/\//.test(n)){e.preventDefault();let t=n.replace(/\.md$/i,``).replace(/^\.\//,``);if(t.startsWith(`/`))location.hash=`#`+t;else{let e=(location.hash.replace(/^#/,``)||`/`).split(`/`).filter(Boolean).slice(0,-1),n=[];for(let r of[...e,...t.split(`/`)])if(!(r===``||r===`.`)){if(r===`..`){n.pop();continue}n.push(r)}location.hash=`#/`+n.join(`/`)}}};return document.addEventListener(`click`,n,!0),()=>{window.removeEventListener(`hashchange`,t),document.removeEventListener(`click`,n,!0)}},navigate(e){location.hash=`#`+(e.startsWith(`/`)?e:`/`+e)}},x={setHtml(e){let t=document.getElementById(`app`);t&&(t.innerHTML=e)},setTitle(e){document.title=e},setSidebar(e){let t=document.getElementById(`sidebar`);t&&(t.innerHTML=e)},setToc(e){let t=document.getElementById(`toc`);t&&(t.innerHTML=e)}},S=e(t(),1),C=e(r(),1),w=e(s(),1);function ee(e){return e.replace(/[&<>"']/g,e=>e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e===`"`?`&quot;`:`&#39;`)}function te(e){let t=e?.light??!1,r={katex:e?.plugins?.katex??!t,footnote:e?.plugins?.footnote??!t,highlight:e?.plugins?.highlight??!t},s=new i({html:!0,linkify:!0,highlight:(e,t)=>{let n=(t||``).trim(),i=n?` language-${n}`:``;if(r.highlight&&n&&o.getLanguage(n))try{let t=o.highlight(e,{language:n,ignoreIllegals:!0}).value;return`<pre class="hljs${i}"><code class="${i.trim()}">${t}</code></pre>`}catch{}return`<pre class="hljs${i}"><code class="${i.trim()}">${ee(e)}</code></pre>`}});return s.use(a,{permalink:a.permalink.headerLink()}),r.footnote&&s.use(C.default),r.katex&&s.use(w.default),[`note`,`tip`,`warning`,`danger`,`info`].forEach(e=>{s.use(n,e,{render(t,n){return t[n].nesting===1?`<div class="admonition ${e}"><p class="admonition-title">${e}</p>`:`</div>`}})}),s.use(S.default,{matcher(e){return/^(https?:)?\/\//.test(e)},attrs:{target:`_blank`,rel:`noopener`}}),{render(e){return d(s.render(e))}}}function T(e){return e.replace(/\s{2,}/g,` `).replace(/>\s+</g,`><`).trim()}var E=new class{cache=new Map;ttl;enabled;storageKey=`ontowave-svg-cache`;maxEntries;constructor(e=!0,t=1800*1e3,n=50){this.enabled=e,this.ttl=t,this.maxEntries=n,this.loadFromStorage()}loadFromStorage(){if(this.enabled)try{let e=globalThis.sessionStorage?.getItem(this.storageKey);if(!e)return;let t=JSON.parse(e),n=Date.now();for(let[e,r]of Object.entries(t))n-r.timestamp<this.ttl&&this.cache.set(e,r)}catch{}}saveToStorage(){try{let e={};this.cache.forEach((t,n)=>{e[n]=t}),globalThis.sessionStorage?.setItem(this.storageKey,JSON.stringify(e))}catch{}}get(e){if(!this.enabled)return null;let t=this.cache.get(e);return t?Date.now()-t.timestamp>this.ttl?(this.cache.delete(e),null):t.svg:null}set(e,t){if(this.enabled){if(this.cache.size>=this.maxEntries&&!this.cache.has(e)){let e=this.cache.keys().next().value;e!==void 0&&this.cache.delete(e)}this.cache.set(e,{svg:t,timestamp:Date.now()}),this.saveToStorage()}}clear(){this.cache.clear();try{globalThis.sessionStorage?.removeItem(this.storageKey)}catch{}}size(){return this.cache.size}};function D(e){let t=globalThis.document?.createElement(`div`);if(!t)return``;t.innerHTML=e;let n=[];return t.querySelectorAll(`h1, h2, h3`).forEach(e=>{let t=e.id||``,r=e.textContent||``,i=e.tagName===`H1`?1:e.tagName===`H2`?2:3;t&&n.push({id:t,text:r,level:i})}),n.map(e=>`${`  `.repeat(e.level-1)}- <a href="#${e.id}">${e.text}</a>`).join(`
`)}async function O(e){let t=Array.from(e.querySelectorAll(`pre code.language-mermaid`));if(t.length===0)return;let{default:n}=await c(async()=>{let{default:e}=await import(`./mermaid-D-rVCKi2.js`).then(e=>e.t);return{default:e}},__vite__mapDeps([0,1]));n.initialize({startOnLoad:!1,securityLevel:`loose`});let r=0;for(let e of t){let t=e.textContent||``,i=e.closest(`pre`),a=document.createElement(`div`);a.className=`mermaid`;let o=`mmd-${Date.now()}-${r++}`;try{let{svg:e}=await n.render(o,t);a.innerHTML=e}catch{a.textContent=t}i.replaceWith(a)}}async function k(e){let t=e.dataset.engine||``,n=e.dataset.source||``,r=`https://kroki.io/${t}/svg`,i=`${r}:${n}`;try{let a=E.get(i);if(!a){let e=await fetch(r,{method:`POST`,headers:{"Content-Type":`text/plain`},body:n});if(!e.ok){console.warn(`[OntoWave] Kroki rendu échoué (${e.status}) pour ${t}`);return}a=T(await e.text()),E.set(i,a)}let o=document.createElement(`div`);o.innerHTML=a;let s=o.querySelector(`svg`);s&&(s.style.maxWidth=`100%`,s.style.height=`auto`,s.querySelectorAll(`a[href]`).forEach(e=>{let t=e.getAttribute(`href`);t&&(t.endsWith(`.md`)||t.endsWith(`.html`)||t.endsWith(`.puml`))&&e.addEventListener(`click`,e=>{e.preventDefault(),window.location.hash=t})}),e.replaceWith(s))}catch{}}async function A(e){let t={plantuml:`plantuml`,puml:`plantuml`,uml:`plantuml`,dot:`graphviz`,mermaid:`mermaid`,d2:`d2`,bpmn:`bpmn`},n=Array.from(e.querySelectorAll(`pre code`));for(let e of n){let n=e.className.split(/\s+/).find(e=>e.startsWith(`language-`));if(!n)continue;let r=t[n.replace(`language-`,``)];if(!r||r===`mermaid`)continue;let i=e.textContent||``,a=e.closest(`pre`);if(!a)continue;let o=document.createElement(`div`);o.className=`kroki-placeholder`,o.dataset.engine=r,o.dataset.source=i,a.replaceWith(o)}let r=Array.from(e.querySelectorAll(`.kroki-placeholder`));if(r.length!==0)if(typeof IntersectionObserver<`u`){let e=new IntersectionObserver(t=>{for(let n of t)n.isIntersecting&&(e.unobserve(n.target),k(n.target))},{rootMargin:`200px`});r.forEach(t=>e.observe(t))}else await Promise.all(r.map(k))}async function j(e,t){let n=D(t),r=document.getElementById(`toc`);r&&(r.innerHTML=n),await O(e),await A(e);try{let t=await(async()=>{let e=g(`/config.json`)||await fetch(`/config.json`,{cache:`no-cache`}).then(e=>e.json()).catch(()=>({})),t={};for(let n of e.roots||[]){let e=n.base===`/`?``:String(n.base||``).replace(/^\/+|\/+$/g,``);e&&(t[e]=String(n.root||``))}return t})(),n=(location.hash||`#/`).replace(/^#/,``).split(`/`).filter(Boolean);if(n.length>=3){let r=n[0],i=n[1],a=n.slice(2).join(`/`),o=t[r];if(o){let t=o.replace(/\/$/,``)+`/`+i,n=null;try{let e=await fetch(`${t}/_delegate.json`,{cache:`no-cache`});if(e.ok){let t=await e.json().catch(()=>null);t&&typeof t.baseUrl==`string`&&(n=t.baseUrl.replace(/\/$/,``))}}catch{}if(!n)try{let e=await fetch(`${t}/CNAME`,{cache:`no-cache`});if(e.ok){let t=(await e.text()).trim();t&&(n=`https://${t}`)}}catch{}if(n){let t=document.createElement(`div`);t.style.margin=`1rem 0`,t.style.padding=`0.75rem`,t.style.background=`#fffbdd`,t.style.border=`1px solid #f0e6a0`;let r=a?`${n.replace(/\/$/,``)}/${a}`:n;t.innerHTML=`Ce module possède son propre site : <a href="${r}">${r}</a>. Ouvrir là-bas pour la navigation complète.`,e.prepend(t)}}}}catch{}}async function M(){try{try{let e=h(`/nav.yml`)||await fetch(`/nav.yml`,{cache:`no-cache`}).then(e=>e.ok?e.text():null);if(e){let{parse:t}=await c(async()=>{let{parse:e}=await import(`./yaml-oZ9mc5Vo.js`).then(e=>e.t);return{parse:e}},__vite__mapDeps([2,1])),n=t(e),r=(e,t)=>{if(Array.isArray(e))return`<ul>${e.map(e=>i(e,t)).join(``)}</ul>`;if(typeof e==`object`&&e){let[n,i]=Object.entries(e)[0];if(typeof i==`string`){let e=String(i);return`<li><a href="#/${(/^[a-z]{2}\//i.test(e)?e:t?`${t}/${e}`:e).replace(/\.md$/i,``)}">${n}</a></li>`}if(Array.isArray(i))return`<li><details open><summary>${n}</summary>${r(i,t)}</details></li>`}return``};if(!Array.isArray(n)&&typeof n==`object`)return Object.entries(n).map(([e,t])=>`<details ${e===`fr`?`open`:``}><summary>${e.toUpperCase()}</summary>${r(t,e)}</details>`).join(``);let i=(e,t)=>r(e,t);return r(n,void 0)}}catch{}let e=g(`/sitemap.json`)||await fetch(`/sitemap.json`,{cache:`no-cache`}).then(e=>e.ok?e.json():null);if(!e)return``;let t=e.items||[],n=new Map;for(let e of t){let t=e.route.replace(`#/`,``).split(`/`).filter(Boolean),r=n;for(let e=0;e<t.length-1;e++){let n=t[e];r.has(n)||r.set(n,new Map),r=r.get(n)}let i=t[t.length-1]||`index`;r.set(i,e)}function r(e){if(e instanceof Map){let t=[];for(let[n,i]of e.entries())i instanceof Map?t.push(`<li><details><summary>${n}</summary>${r(i)}</details></li>`):t.push(`<li><a href="${i.route}">${i.title||n}</a></li>`);return`<ul>${t.join(``)}</ul>`}return``}return r(n)}catch{return``}}async function N(e){try{let t=await fetch(`/sitemap.json`,{cache:`no-cache`});if(!t.ok)return{};let n=(await t.json()).items||[],r=n.findIndex(t=>t.route.replace(`#`,``)===e.replace(`#`,``));return r===-1?{}:{prev:n[r-1]?.route,next:n[r+1]?.route}}catch{return{}}}function ne(e){return e.toLowerCase().normalize(`NFKD`).replace(/[^a-z0-9\s]/g,` `).split(/\s+/).filter(Boolean)}function P(){let e=[],t=new Map,n=[];async function r(){try{n=((g(`/config.json`)||await fetch(`/config.json`,{cache:`no-cache`}).then(e=>e.json())).roots||[]).map(e=>({base:String(e.base||``).replace(/^\/+|\/+$/g,``),root:String(e.root||``)}))}catch{}}function i(e,t){let n=e.replace(/\.md$/i,``);return t?`#/`+t.replace(/^\/+|\/+$/g,``)+`/`+n.replace(/^\/+/,``):`#/`+n.replace(/^\/+/,``)}function a(e){let[t,...r]=e.replace(/^#\//,``).split(`/`),i=t||``,a=r.join(`/`)||`index`,o=n.find(e=>String(e.base)===i);return o?`${o.root.replace(/\/$/,``)}/${a}.md`:null}async function o(){try{let n=g(`/search-index.json`);if(n!==null){if(Array.isArray(n)&&n.length>0){e=n.map(e=>({route:e.route,title:e.title}));for(let e of n)t.set(e.route,{title:e.title,text:e.text||``})}return!0}let r=await fetch(`/search-index.json`,{cache:`no-cache`}).then(e=>e.ok?e.json():null);if(!Array.isArray(r)||r.length===0)return!1;e=r.map(e=>({route:e.route,title:e.title}));for(let e of r)t.set(e.route,{title:e.title,text:e.text||``});return!0}catch{return!1}}async function s(){try{let n=g(`/sitemap.json`)||await fetch(`/sitemap.json`,{cache:`no-cache`}).then(e=>e.ok?e.json():null);e=Array.isArray(n.items)?n.items:[];for(let n of e)t.set(n.route,{title:n.title||n.route.replace(`#/`,``)});return e.length>0}catch{return!1}}async function l(){try{let n=h(`/nav.yml`)||await fetch(`/nav.yml`,{cache:`no-cache`}).then(e=>e.ok?e.text():null);if(!n)return!1;let{parse:r}=await c(async()=>{let{parse:e}=await import(`./yaml-oZ9mc5Vo.js`).then(e=>e.t);return{parse:e}},__vite__mapDeps([2,1])),a=r(n),o=[],s=(e,t,n)=>{o.push({route:i(t,n),title:e})},l=(e,t)=>{if(Array.isArray(e))for(let n of e)l(n,t);else if(typeof e==`object`&&e){let[n,r]=Object.entries(e)[0];typeof r==`string`?s(n,r,t):Array.isArray(r)&&l(r,t)}};if(Array.isArray(a))l(a);else if(typeof a==`object`&&a)for(let[e,t]of Object.entries(a))l(t,e);e=o;for(let n of e)t.set(n.route,{title:n.title||n.route.replace(`#/`,``)});return e.length>0}catch{return!1}}async function u(){try{let n=h(`/pages.txt`)||await fetch(`/pages.txt`,{cache:`no-cache`}).then(e=>e.ok?e.text():null);if(!n)return!1;e=n.split(/\r?\n/).map(e=>e.trim()).filter(Boolean).map(e=>({route:i(e),title:e.replace(/\.md$/i,``)}));for(let n of e)t.set(n.route,{title:n.title||n.route.replace(`#/`,``)});return e.length>0}catch{return!1}}async function d(){await r();for(let n of e){if(t.get(n.route)?.text)continue;let e=n.path||a(n.route);if(e)try{let r=h(e)||await fetch(e,{cache:`no-cache`}).then(e=>e.ok?e.text():null);if(!r)continue;let i=r.replace(/```[\s\S]*?```/g,` `).replace(/[#>*_`\-\[\]()]/g,` `),a=t.get(n.route)?.title||n.title||n.route;t.set(n.route,{title:a,text:i})}catch{}}}async function f(){if(await r(),await o())return;if(await s()){d();return}if(await l()){d();return}if(await u()){d();return}let n=location.hash||`#/`;t.set(n,{title:document.title.replace(/\s*—.*$/,``)}),e=[{route:n,title:document.title}]}function p(e,t){let n=ne(e);if(n.length===0)return 0;let r=0,i=t.title.toLowerCase();for(let e of n)i.includes(e)&&(r+=5),t.text&&t.text.toLowerCase().includes(e)&&(r+=1);return r}function m(){let e=(location.hash.replace(/^#\/?/,``).split(`/`)[0]||``).toLowerCase();return n.map(e=>String(e.base||``).toLowerCase()).filter(Boolean).includes(e)?e:``}function _(n,r=20){let i=[],a=m(),o=a?e.filter(e=>e.route.toLowerCase().startsWith(`#/${a}/`)):e,s=e=>{for(let r of e){let e=t.get(r.route);if(!e)continue;let a=p(n,e);a>0&&i.push({route:r.route,title:e.title,score:a})}};return s(o),i.length===0&&a&&s(e),i.sort((e,t)=>t.score-e.score),i.slice(0,r)}function v(e,t){let n=e=>{if(!e){t.classList.add(`hidden`),t.innerHTML=``;return}t.innerHTML=`<ul>${_(e).map(e=>`<li><a href="${e.route}"><strong>${e.title}</strong><br/><small>${e.route}</small></a></li>`).join(``)}</ul>`,t.classList.remove(`hidden`)};e.addEventListener(`input`,()=>n(e.value)),document.addEventListener(`click`,n=>{!t.contains(n.target)&&n.target!==e&&t.classList.add(`hidden`)})}async function y(n){if(n&&n.length){e=n;for(let n of e)t.set(n.route,{title:n.title||n.route})}else await s()||await l()||await u();await d()}function b(){let n=[];for(let r of e){let e=t.get(r.route);e&&n.push({route:r.route,title:e.title,text:e.text})}return JSON.stringify(n,null,2)}async function x(n){e=n.split(/\r?\n/).map(e=>e.trim()).filter(Boolean).map(e=>({route:i(e),title:e.replace(/\.md$/i,``)}));for(let n of e)t.set(n.route,{title:n.title||n.route.replace(`#/`,``)})}function S(){return e.length>0&&Array.from(t.values()).some(e=>typeof e.text==`string`)}return{init:f,bind:v,enableLiveIndexingFrom:y,exportIndex:b,importPagesList:x,hasReadyIndex:S}}function F(e,t,n){let r=new Blob([t],{type:n}),i=document.createElement(`a`);i.href=URL.createObjectURL(r),i.download=e,i.click(),URL.revokeObjectURL(i.href)}async function I(e){try{return(await fetch(e,{cache:`no-cache`})).ok}catch{return!1}}function L(e){return`# ${e===`fr`?`Bienvenue`:`Welcome`}\n\n${e===`fr`?`Page d’accueil par défaut.`:`Default landing page.`}\n\n> Éditez ce fichier: \`content/${e||``}/index.md\``}function R(e){return e.some(e=>(e.base||``).toLowerCase()===`fr`)?`fr:
  - Accueil: fr/index.md
  - Démo:
    - Aperçu: fr/demo/overview.md
    - Liens: fr/demo/links.md
    - Code: fr/demo/code.md
    - Mermaid: fr/demo/mermaid.md
    - Math: fr/demo/math.md
    - PlantUML: fr/demo/plantuml.md
    - Graphviz: fr/demo/graphviz.md
    - D2: fr/demo/d2.md
`:`en:
  - Home: en/index.md
  - Demo:
    - Overview: en/demo/overview.md
    - Links: en/demo/links.md
    - Code: en/demo/code.md
    - Mermaid: en/demo/mermaid.md
    - Math: en/demo/math.md
    - PlantUML: en/demo/plantuml.md
    - Graphviz: en/demo/graphviz.md
    - D2: en/demo/d2.md
`}async function z(e,t){let n=(t.roots||[]).map(e=>({base:(e.base||``).toString().replace(/^\/+/,``).replace(/\/+$/,``),root:String(e.root||``)})),r=[];await I(`/nav.yml`)||r.push({key:`nav.yml`,path:`public/nav.yml`,type:`text/plain`,make:()=>R(n)}),await I(`/pages.txt`)||r.push({key:`pages.txt`,path:`public/pages.txt`,type:`text/plain`,make:()=>n.map(e=>e.base?`${e.base}/index.md`:`index.md`).join(`
`)}),await I(`/search-index.json`)||r.push({key:`search-index.json`,path:`search-index.json`,type:`application/json`,make:async()=>{let e=P();return await e.init(),e.exportIndex()}});for(let e of n)if(!await I(`/${e.root.replace(/\/$/,``)}/index.md`)){let t=e.base?`content/${e.base}/index.md`:`content/index.md`;r.push({key:t,path:t,type:`text/plain`,make:()=>L(e.base)})}let i=JSON.stringify(t,null,2);e.innerHTML=`
    <h1>Configuration du site</h1>
    <p>Marque: <strong>${t.brand||`OntoWave`}</strong></p>
    <h2>Fichier config.json</h2>
    <p>Éditez puis téléchargez le fichier pour l’ajouter à votre déploiement statique.</p>
    <textarea id="cfg-json" style="width:100%;height:200px">${i}</textarea>
    <div class="mt-sm">
      <button id="btn-dl-config" type="button">Télécharger config.json</button>
    </div>
    <h2 class="mt-sm">Fichiers manquants détectés</h2>
    <p>${r.length?`Les éléments suivants semblent manquer. Vous pouvez les télécharger individuellement ou en une seule archive.`:`Aucun fichier essentiel manquant détecté.`}</p>
    <ul id="missing-list"></ul>
    <div class="mt-sm">
      <button id="btn-dl-zip" type="button" ${r.length?``:`disabled`}>Télécharger tout en ZIP</button>
    </div>
  `;let a=document.getElementById(`missing-list`);a.innerHTML=r.map(e=>`<li><code>${e.path}</code> <button data-key="${e.key}">Télécharger</button></li>`).join(``),a.addEventListener(`click`,async e=>{let t=e.target;if(t.tagName===`BUTTON`&&t.dataset.key){let e=r.find(e=>e.key===t.dataset.key);if(!e)return;let n=await e.make();F(e.path.split(`/`).pop()||e.key,n,e.type)}}),document.getElementById(`btn-dl-config`)?.addEventListener(`click`,()=>{F(`config.json`,document.getElementById(`cfg-json`).value,`application/json`)}),document.getElementById(`btn-dl-zip`)?.addEventListener(`click`,async()=>{if(!r.length)return;await new Promise(e=>{let t=document.createElement(`script`);t.src=`https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`,t.onload=e,document.head.appendChild(t)});let e=window.JSZip,t=new e;for(let e of r){let n=await e.make();t.file(e.path,n)}let n=await t.generateAsync({type:`blob`}),i=document.createElement(`a`);i.href=URL.createObjectURL(n),i.download=`ontowave-missing.zip`,i.click(),URL.revokeObjectURL(i.href)})}var B=`ow-reading-theme`,V=`ow-note:`,H=`ow-markov`,U=200;function W(e){return e!==`__proto__`&&e!==`constructor`&&e!==`prototype`}function G(e){document.body.classList.remove(`ow-theme-light`,`ow-theme-sepia`,`ow-theme-dark`),document.body.classList.add(`ow-theme-${e}`);try{localStorage.setItem(B,e)}catch{}}function K(){try{let e=localStorage.getItem(B);if(e&&[`light`,`sepia`,`dark`].includes(e))return e}catch{}return`light`}function q(){let e=K(),t=[`light`,`sepia`,`dark`],n=t[(t.indexOf(e)+1)%t.length];return G(n),n}function J(){try{return JSON.parse(localStorage.getItem(H)||`{}`)}catch{return{}}}function Y(e){try{let t=Object.entries(e);if(t.length>U){t.sort((e,t)=>Object.values(e[1]).reduce((e,t)=>e+t,0)-Object.values(t[1]).reduce((e,t)=>e+t,0));let e=Object.fromEntries(t.slice(t.length-U));localStorage.setItem(H,JSON.stringify(e))}else localStorage.setItem(H,JSON.stringify(e))}catch{}}function X(e,t){if(e===t||!W(e)||!W(t))return;let n=J();n[e]||(n[e]=Object.create(null)),n[e][t]=(n[e][t]||0)+1,Y(n)}function re(e){let t=J()[e];return t?Object.entries(t).sort((e,t)=>t[1]-e[1]).slice(0,3).map(([e])=>e):[]}var Z=null;async function ie(){if(Z!==null)return Z;try{let e=await fetch(`/sitemap.json`,{cache:`default`});return e.ok?(Z=(await e.json()).items||[],Z):[]}catch{return[]}}async function ae(e){try{let t=(await ie()).find(t=>t.route===e);if(!t)return;let n=t.path?.replace(/^\//,``)||``;n&&await fetch(`/`+n,{cache:`force-cache`}).catch(()=>{})}catch{}}function oe(e,t){try{let n=V+e;t.trim()?localStorage.setItem(n,t):localStorage.removeItem(n)}catch{}}function se(e){try{return localStorage.getItem(V+e)||``}catch{return``}}var Q=`
/* === Thèmes de lecture OntoWave === */
body.ow-theme-light {
  --ow-bg: #ffffff;
  --ow-text: #1a1a1a;
  --ow-link: #0066cc;
  --ow-code-bg: #f5f5f5;
  --ow-border: #e0e0e0;
  --ow-sidebar-bg: #f9f9f9;
}
body.ow-theme-sepia {
  --ow-bg: #f4ede4;
  --ow-text: #3a2a1a;
  --ow-link: #7a4a20;
  --ow-code-bg: #e8ddd4;
  --ow-border: #c8b8a8;
  --ow-sidebar-bg: #ede6de;
}
body.ow-theme-dark {
  --ow-bg: #1a1a1a;
  --ow-text: #e0e0e0;
  --ow-link: #66aaff;
  --ow-code-bg: #2a2a2a;
  --ow-border: #444444;
  --ow-sidebar-bg: #222222;
}
body.ow-theme-light,
body.ow-theme-sepia,
body.ow-theme-dark {
  background-color: var(--ow-bg);
  color: var(--ow-text);
}
body.ow-theme-light a,
body.ow-theme-sepia a,
body.ow-theme-dark a {
  color: var(--ow-link);
}
body.ow-theme-light code, body.ow-theme-light pre,
body.ow-theme-sepia code, body.ow-theme-sepia pre,
body.ow-theme-dark code, body.ow-theme-dark pre {
  background-color: var(--ow-code-bg);
}
body.ow-theme-dark code, body.ow-theme-dark pre {
  color: #d4d4d4;
}
body.ow-theme-light #sidebar, body.ow-theme-light nav,
body.ow-theme-sepia #sidebar, body.ow-theme-sepia nav,
body.ow-theme-dark #sidebar, body.ow-theme-dark nav {
  background-color: var(--ow-sidebar-bg);
}
body.ow-theme-dark table {
  border-color: var(--ow-border);
}
body.ow-theme-dark th,
body.ow-theme-dark td {
  border-color: var(--ow-border);
}

/* === Bouton de bascule de thème === */
.ow-theme-btn {
  background: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  padding: 2px 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.ow-theme-btn:hover {
  opacity: 1;
}

/* === Notes légères === */
.ow-notes-panel {
  margin: 1.5rem 0;
  padding: 0.75rem;
  border: 1px solid var(--ow-border, #e0e0e0);
  border-radius: 6px;
  background: var(--ow-code-bg, #f5f5f5);
}
.ow-notes-panel textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 4px;
  padding: 0.5rem;
  font-family: inherit;
  font-size: 0.9em;
  resize: vertical;
  background: var(--ow-bg, #fff);
  color: var(--ow-text, #1a1a1a);
  box-sizing: border-box;
}

/* === CSS d'impression (PDF) === */
@media print {
  #sidebar,
  #toc,
  #site-header,
  #floating-menu,
  .ow-ux-toolbar,
  .ow-notes-panel,
  nav {
    display: none !important;
  }
  body {
    background: #fff !important;
    color: #000 !important;
    font-size: 12pt;
  }
  #app, main, article {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }
  a[href^="#"]::after,
  a[href^="javascript"]::after {
    content: "";
  }
  pre, code {
    white-space: pre-wrap;
    word-break: break-word;
  }
  h1, h2, h3 {
    page-break-after: avoid;
  }
  p, li {
    orphans: 3;
    widows: 3;
  }
}
`;function ce(){if(document.getElementById(`ow-ux-styles`))return;let e=document.createElement(`style`);e.id=`ow-ux-styles`,e.textContent=Q,document.head.appendChild(e)}function $(e){return{light:`☀ Clair`,sepia:`📖 Sépia`,dark:`🌙 Sombre`}[e]}function le(e,t=!0){if(!e)return;let n=document.getElementById(`ow-ux-toolbar`);n&&n.remove();let r=e.querySelector(`.ow-notes-panel`);r&&r.remove();let i=document.createElement(`div`);i.id=`ow-ux-toolbar`,i.className=`ow-ux-toolbar`,i.style.cssText=`display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:1rem; padding:0.4rem 0; border-bottom:1px solid var(--ow-border,#e0e0e0); font-size:0.85em;`;let a=document.createElement(`button`);a.className=`ow-theme-btn`,a.title=`Changer le thème de lecture (j/k: défiler, n/p: page suiv./préc.)`,a.textContent=$(K()),a.addEventListener(`click`,()=>{a.textContent=$(q())}),i.appendChild(a);let o=document.createElement(`button`);if(o.className=`ow-theme-btn`,o.title=`Exporter en PDF (impression)`,o.textContent=`🖨 PDF`,o.addEventListener(`click`,()=>window.print()),i.appendChild(o),t){let t=!1,n=document.createElement(`button`);n.className=`ow-theme-btn`,n.title=`Afficher/masquer les notes pour cette page`,n.textContent=`📝 Notes`;let r=document.createElement(`div`);r.className=`ow-notes-panel`,r.style.display=`none`;let a=document.createElement(`textarea`);a.placeholder=`Vos notes pour cette page… (sauvegardées automatiquement)`,a.value=se(location.hash||`#/`);let o=null;a.addEventListener(`input`,()=>{let e=location.hash||`#/`;o&&clearTimeout(o),o=setTimeout(()=>{oe(e,a.value)},600)}),r.appendChild(a),n.addEventListener(`click`,()=>{t=!t,r.style.display=t?`block`:`none`,t&&a.focus()}),i.appendChild(n),e.prepend(r)}e.prepend(i)}function ue(e){let t=t=>{let n=t.target?.tagName?.toLowerCase();if(!(n===`input`||n===`textarea`||n===`select`)&&!t.target?.isContentEditable)switch(t.key.toLowerCase()){case`j`:window.scrollBy({top:120,behavior:`smooth`});break;case`k`:window.scrollBy({top:-120,behavior:`smooth`});break;case`n`:{let{next:t}=e();t&&(location.hash=t.startsWith(`#`)?t:`#${t}`);break}case`p`:{let{prev:t}=e();t&&(location.hash=t.startsWith(`#`)?t:`#${t}`);break}}};return document.addEventListener(`keydown`,t),()=>document.removeEventListener(`keydown`,t)}function de(e={}){let t={themes:e.themes!==!1,keyboard:e.keyboard!==!1,notes:e.notes!==!1,prefetch:e.prefetch!==!1};ce(),t.themes&&G(K());let n={},r=``;return t.keyboard&&ue(()=>n),{onRouteChange:(e,i)=>{if(t.prefetch&&r&&r!==e){X(r,e);let t=re(e);for(let e of t)ae(e)}if(r=e,n=i,t.notes||t.themes){let e=document.getElementById(`app`);e&&le(e,t.notes)}}}}(async()=>{let e=g(`/config.json`)||await fetch(`/config.json`,{cache:`no-cache`}).then(e=>e.json()),t=e.engine??`v2`;try{let t=document.getElementById(`site-header`),n=document.getElementById(`sidebar`),r=document.getElementById(`toc`),i=document.getElementById(`floating-menu`),a=e.ui||{};a.minimal?(document.body.classList.add(`minimal`),t?.classList.add(`hidden-by-config`),n?.classList.add(`hidden-by-config`),r?.classList.add(`hidden-by-config`)):(a.header===!1&&t?.classList.add(`hidden-by-config`),a.sidebar===!1&&n?.classList.add(`hidden-by-config`),a.toc===!1&&r?.classList.add(`hidden-by-config`)),a.menu===!1&&i?.classList.add(`hidden-by-config`)}catch{}try{if(location.hash===``||location.hash===`#/`||location.hash===`#`){let t=e.i18n?.default||(e.roots?.[0]?.base&&e.roots[0].base!==`/`?e.roots[0].base:null)||null;location.hash=t?`#${t}/index`:`#/index`;return}}catch{}let n=document.getElementById(`brand`);n&&typeof e.brand==`string`&&(n.textContent=e.brand);let r=typeof e.ux==`object`?e.ux:{},i=e.ux===!1?null:de(r);if(t===`v2`){await p({config:_,content:v,router:b,view:x,md:te({light:!1}),enhance:{afterRender:async(t,n)=>{let r=document.getElementById(`app`);await j(r,t);try{let t=window;t.__owViewCache||={lastHtml:``,lastRoute:``,lastMd:``,fetching:!1};let n=t.__owViewCache;n.lastHtml=r.innerHTML,n.lastRoute=location.hash.split(`?`)[0];let i=(e.roots||[]).map(e=>({base:String(e.base||``).replace(/\/$/,``),root:String(e.root||``).replace(/\/$/,``)})),a=e=>e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]||e),o=()=>(location.hash.replace(/^#/,``)||`/`).split(`?`)[0],s=()=>{let[,e]=(location.hash||`#/`).split(`?`);return new URLSearchParams(e||``).get(`view`)||`html`},c=async()=>{if(!n.fetching){n.fetching=!0;try{let e=o().split(`/`).filter(Boolean),t=e[0]||``,r=i.find(e=>e.base===t),a=e.slice(1);r||(t=``);let s=r?r.root:i[0]?.root||`/content`,c=a.join(`/`),l=[];c?(l.push(`${s}/${c}.md`),l.push(`${s}/${c}/index.md`)):l.push(`${s}/index.md`);for(let e of l)try{let t=await fetch(e,{cache:`no-cache`});if(t.ok){n.lastMd=await t.text();break}}catch{}}finally{n.fetching=!1}}},l=async()=>{let e=s();try{document.body.classList.remove(`mode-html`,`mode-md`,`mode-split`)}catch{}try{document.body.classList.add(`mode-${e===`sbs`?`split`:e}`)}catch{}if(e===`html`){r.innerHTML=n.lastHtml;return}n.lastMd||await c();let t=n.lastMd?a(n.lastMd):`*Markdown introuvable*`;e===`md`?r.innerHTML=`<div class="ow-md-only"><pre class="ow-raw-md">${t}</pre></div>`:(e===`split`||e===`sbs`)&&(r.innerHTML=`<div class="ow-split"><div class="ow-pane ow-raw"><pre class="ow-raw-md">${t}</pre></div><div class="ow-pane ow-rendered">${n.lastHtml}</div></div>`)};await l(),t.__owViewListener||(t.__owViewListener=!0,window.addEventListener(`hashchange`,()=>{location.hash.split(`?`)[0]===n.lastRoute&&l()}))}catch{}try{let e=document.getElementById(`view-toggles`);if(e){let t=t=>{e.querySelectorAll(`.pill`).forEach(e=>e.classList.remove(`active`));let n=t===`split`||t===`sbs`?`[data-view="split"]`:t===`md`?`[data-view="md"]`:`[data-view="html"]`,r=e.querySelector(n);r&&r.classList.add(`active`)},n=e=>{let[t,n]=(location.hash||`#/`).split(`?`),r=new URLSearchParams((n||``).replace(/^\?/,``));e===`html`?r.delete(`view`):r.set(`view`,e);let i=r.toString();location.hash=i?`${t}?${i}`:t},[r,i]=(location.hash||`#/`).split(`?`);t(new URLSearchParams(i||``).get(`view`)||`html`),e.querySelectorAll(`button[data-view]`).forEach(e=>{e.addEventListener(`click`,e=>{n(e.currentTarget.getAttribute(`data-view`)||`html`)})})}}catch{}let a=await M();if(a){let e=document.getElementById(`sidebar`);e&&(e.innerHTML=a)}let o=await N(location.hash||`#/`),s=e.ui||{};if(s.footer!==!1&&!s.minimal){let e=document.createElement(`div`);e.style.marginTop=`2rem`,e.innerHTML=`
            <hr/>
            <div style="display:flex; justify-content:space-between">
              <span>${o.prev?`<a href="${o.prev}">← Précédent</a>`:``}</span>
              <span>${o.next?`<a href="${o.next}">Suivant →</a>`:``}</span>
            </div>`,r.appendChild(e)}let c=async e=>{try{let t=((await fetch(`/sitemap.json`,{cache:`no-cache`}).then(e=>e.json()).catch(()=>null))?.items||[]).find(t=>t.route===e);if(!t)return;let n=t.path?.replace(/^\//,``)||``;n&&await fetch(`/`+n,{cache:`force-cache`}).catch(()=>{})}catch{}};o.prev&&c(o.prev),o.next&&c(o.next),i&&i.onRouteChange(location.hash||`#/`,o)}}}).start();try{let e=document.getElementById(`app`),t=location.hash===``||location.hash===`#/`||location.hash===`#`;/404 — Not found/.test(e.textContent||``)&&t&&(e.innerHTML=`
          <h1>Configuration requise</h1>
          <p>Ajoutez un fichier <code>index.md</code> dans votre racine de contenu (<code>content/[lang]/index.md</code> avec i18n),
          ou modifiez <code>public/config.json</code> pour pointer vers vos dossiers.</p>
          <p>Vous pouvez aussi préparer la recherche en important un <code>pages.txt</code> via le menu Options, puis exporter <code>search-index.json</code> à déposer dans <code>docs/</code>.</p>
        `),location.hash.replace(/^#/,``)===`/config`&&await z(e,await(await fetch(`/config.json`,{cache:`no-cache`})).json());try{let e=async e=>{if(g(e)!==null||h(e)!==null)return!0;try{return(await fetch(e,{cache:`no-cache`})).ok}catch{return!1}},t=await e(`/nav.yml`),n=await e(`/search-index.json`),r=await e(`/sitemap.json`);if(!t||!n&&!r){let e=document.querySelector(`.floating-menu a[href="#/config"]`);e&&!(e.textContent||``).includes(`⚠️`)&&(e.textContent=(e.textContent||`Configuration`)+` ⚠️`)}}catch{}}catch{}}else{let[{getCurrentRoute:t,onRouteChange:n},{createMd:r,rewriteLinks:i}]=await Promise.all([c(()=>import(`./router-CuV4RpOh.js`),[]),c(()=>import(`./markdown-cjiG2FRR.js`),__vite__mapDeps([3,1,4,5]))]),a=document.getElementById(`app`),o=r();function s(e,t){let n=[],r=t.replace(/\/$/,``)||`/`;for(let t of e){let e=t.root.replace(/\/$/,``),i=r===`/`?`/index`:r;n.push(`${e}${i}.md`),n.push(`${e}${r}/index.md`)}return n}async function l(e,t){let n=s(e,t);for(let e of n)try{let t=await fetch(e,{cache:`no-cache`});if(t.ok)return await t.text()}catch{}return`# 404 — Not found\n\nAucun document pour \`${t}\``}let u=e;async function d(){let{path:e}=t(),n=await l(u.roots,e);a.innerHTML=o.render(n),i(a);let r=a.querySelector(`h1`)?.textContent?.trim();r&&(document.title=`${r} — OntoWave`)}await d(),n(()=>{d()})}try{let e=document.getElementById(`search`),t=document.getElementById(`search-results`),n=document.getElementById(`opt-search`),r=document.getElementById(`opt-pages`),i=document.getElementById(`opt-export-index`),a=document.getElementById(`opt-download-pages`),o=document.getElementById(`opt-state`),s=P(),c=!1,l=async()=>{c&&(await s.init(),e&&t&&s.bind(e,t),o&&(o.textContent=s.hasReadyIndex()?`Index prêt`:`Index minimal (titres)`))};try{(g(`/search-index.json`)||await fetch(`/search-index.json`,{cache:`no-cache`}).then(e=>e.ok).catch(()=>!1))&&(c=!0,n&&(n.checked=!0),await l())}catch{}n?.addEventListener(`change`,async()=>{c=!!n.checked,c&&await l()}),r?.addEventListener(`change`,async()=>{let n=r.files?.[0];if(!n)return;let i=await n.text();await s.importPagesList(i),await s.enableLiveIndexingFrom(),e&&t&&s.bind(e,t),o&&(o.textContent=`Index en construction…`)}),i?.addEventListener(`click`,()=>{let e=s.exportIndex(),t=new Blob([e],{type:`application/json`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`search-index.json`,n.click(),URL.revokeObjectURL(n.href)}),a?.addEventListener(`click`,async()=>{try{let e=await fetch(`/pages.txt`,{cache:`no-cache`}),t=e.ok?await e.text():``,n=new Blob([t],{type:`text/plain`}),r=document.createElement(`a`);r.href=URL.createObjectURL(n),r.download=`pages.txt`,r.click(),URL.revokeObjectURL(r.href)}catch{}})}catch{}})();