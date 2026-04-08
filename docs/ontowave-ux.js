(function(){"use strict";let i=null;async function f(){if(i)return i;try{const t=await fetch("/sitemap.json",{cache:"no-cache"});t.ok&&(i=(await t.json()).items||[])}catch{}return i||[]}function C(t){var n,a;if(!i)return{};const e=i,o=e.findIndex(r=>r.route.replace("#","")===t.replace("#",""));return o===-1?{}:{prev:(n=e[o-1])==null?void 0:n.route,next:(a=e[o+1])==null?void 0:a.route}}function b(){f(),document.addEventListener("keydown",t=>{if(t.target.closest("input,textarea,select,[contenteditable]")||t.ctrlKey||t.metaKey||t.altKey)return;const{prev:o,next:n}=C(location.hash||"#/");switch(t.key){case"j":case"n":n&&(t.preventDefault(),location.hash=n.replace(/^#/,""));break;case"k":case"p":o&&(t.preventDefault(),location.hash=o.replace(/^#/,""));break}}),window.addEventListener("hashchange",()=>void f())}const m=["light","sepia","dark"],S={light:"☀️",sepia:"📖",dark:"🌙"},I=`
:root {
  --ow-bg: #ffffff;
  --ow-text: #1a1a1a;
  --ow-link: #0066cc;
  --ow-border: #e0e0e0;
  --ow-code-bg: #f5f5f5;
}
:root[data-ow-theme="sepia"] {
  --ow-bg: #f4ecd8;
  --ow-text: #5b4636;
  --ow-link: #8b6914;
  --ow-border: #d4b896;
  --ow-code-bg: #ede0cc;
}
:root[data-ow-theme="dark"] {
  --ow-bg: #1a1a2e;
  --ow-text: #e0e0e0;
  --ow-link: #64b5f6;
  --ow-border: #3a3a5a;
  --ow-code-bg: #252540;
}
body {
  background-color: var(--ow-bg) !important;
  color: var(--ow-text) !important;
  transition: background-color 0.25s ease, color 0.25s ease;
}
a { color: var(--ow-link) !important; }
code, pre {
  background: var(--ow-code-bg) !important;
  transition: background-color 0.25s ease;
}
`,T=`
#ow-theme-toggle {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
#ow-theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
`;function x(t){document.documentElement.setAttribute("data-ow-theme",t);try{localStorage.setItem("ow-theme",t)}catch{}}function v(){if(!document.getElementById("ow-theme-css")){const e=document.createElement("style");e.id="ow-theme-css",e.textContent=I+T,document.head.appendChild(e)}let t="light";try{const e=localStorage.getItem("ow-theme");e&&m.includes(e)&&(t=e)}catch{}if(x(t),!document.getElementById("ow-theme-toggle")){const e=document.createElement("button");e.id="ow-theme-toggle",e.type="button";const o=()=>{const n=document.documentElement.getAttribute("data-ow-theme")||"light";e.textContent=S[n],e.title=`Thème : ${n} — cliquer pour changer`,e.setAttribute("aria-label",`Thème de lecture : ${n}`)};o(),e.addEventListener("click",()=>{const n=document.documentElement.getAttribute("data-ow-theme")||"light",a=m[(m.indexOf(n)+1)%m.length];x(a),o()}),document.body.appendChild(e)}}const L=`
@media print {
  #floating-menu,
  .floating-menu,
  .ontowave-floating-menu,
  #sidebar,
  #toc,
  #site-header,
  #search,
  #view-toggles,
  #ow-theme-toggle,
  #ow-notes-panel,
  nav {
    display: none !important;
  }
  body {
    background: white !important;
    color: black !important;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
  }
  a {
    color: inherit !important;
    text-decoration: underline;
  }
  pre, code {
    background: #f5f5f5 !important;
    color: black !important;
    border: 1px solid #ccc;
    font-family: 'Courier New', monospace;
  }
  h1, h2, h3, h4 { page-break-after: avoid; }
  pre, blockquote, img, figure { page-break-inside: avoid; }
  @page {
    margin: 2cm;
  }
}
`;function y(){if(!document.getElementById("ow-print-css")){const t=document.createElement("style");t.id="ow-print-css",t.textContent=L,document.head.appendChild(t)}}const d=new Map;let u="";function N(t,e){if(!t||!e||t===e)return;d.has(t)||d.set(t,new Map);const o=d.get(t);o.set(e,(o.get(e)??0)+1)}function O(t){const e=d.get(t);if(!e||e.size===0)return null;let o=null,n=0;for(const[a,r]of e)r>n&&(n=r,o=a);return o}async function _(t){var e,o;try{if(!(i??await f()).find(s=>s.route===t))return;const l=(await fetch("/config.json",{cache:"force-cache"}).then(s=>s.json()).catch(()=>({roots:[]}))).roots||[],p=t.replace(/^#\//,"").replace(/^\//,"").split("/").filter(Boolean),$=p[0]||"",h=l.find(s=>s.base===$),g=h?h.root.replace(/\/$/,""):((o=(e=l[0])==null?void 0:e.root)==null?void 0:o.replace(/\/$/,""))||"/content",w=(h?p.slice(1):p).join("/"),M=w?[`${g}/${w}.md`,`${g}/${w}/index.md`]:[`${g}/index.md`];for(const s of M)await fetch(s,{cache:"force-cache"}).catch(()=>{})}catch{}}function E(){try{const o=localStorage.getItem("ow-markov");if(o){const n=JSON.parse(o);for(const[a,r]of Object.entries(n))d.set(a,new Map(Object.entries(r)))}}catch{}const t=()=>{try{const o={};for(const[n,a]of d)o[n]=Object.fromEntries(a);localStorage.setItem("ow-markov",JSON.stringify(o))}catch{}},e=()=>{const o=location.hash||"#/";u&&N(u,o),u=o;const n=O(o);n&&n!==o&&_(n),t()};u=location.hash||"#/",window.addEventListener("hashchange",e)}const j=`
#ow-notes-toggle {
  position: fixed;
  bottom: 4.25rem;
  right: 1.25rem;
  z-index: 9999;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.15s ease;
}
#ow-notes-toggle:hover { transform: scale(1.1); }
#ow-notes-panel {
  position: fixed;
  bottom: 7.25rem;
  right: 1.25rem;
  z-index: 9998;
  width: 280px;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  display: none;
  flex-direction: column;
  overflow: hidden;
}
#ow-notes-panel.open { display: flex; }
#ow-notes-header {
  padding: 0.5rem 0.75rem;
  background: var(--ow-code-bg, #f5f5f5);
  border-bottom: 1px solid var(--ow-border, #ccc);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ow-text, #222);
}
#ow-notes-textarea {
  flex: 1;
  border: none;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  max-height: 300px;
  background: var(--ow-bg, #fff);
  color: var(--ow-text, #222);
  outline: none;
}
`;function z(){if(!document.getElementById("ow-notes-css")){const c=document.createElement("style");c.id="ow-notes-css",c.textContent=j,document.head.appendChild(c)}const t=()=>`ow-note:${location.hash||"#/"}`,e=()=>{try{return localStorage.getItem(t())??""}catch{return""}},o=c=>{try{localStorage.setItem(t(),c)}catch{}},n=document.createElement("div");n.id="ow-notes-panel",n.innerHTML='<div id="ow-notes-header">📝 Notes — <span id="ow-notes-page"></span></div>';const a=document.createElement("textarea");a.id="ow-notes-textarea",a.placeholder="Vos notes pour cette page…",a.value=e(),a.addEventListener("input",()=>o(a.value)),n.appendChild(a);const r=document.createElement("button");r.id="ow-notes-toggle",r.type="button",r.textContent="📝",r.title="Notes pour cette page",r.setAttribute("aria-label","Ouvrir/fermer le panneau de notes"),r.addEventListener("click",()=>{n.classList.toggle("open"),n.classList.contains("open")&&(a.value=e(),a.focus())}),document.body.appendChild(n),document.body.appendChild(r),window.addEventListener("hashchange",()=>{const c=document.getElementById("ow-notes-page");c&&(c.textContent=location.hash||"#/"),n.classList.contains("open")&&(a.value=e())});const l=document.getElementById("ow-notes-page");l&&(l.textContent=location.hash||"#/")}window.OntoWaveUX={setupKeyboardNav:b,setupThemes:v,setupPrint:y,setupMarkovPrefetch:E,setupNotes:z};const k=()=>{window.__OW_UX_AUTO__!==!1&&(b(),v(),y(),E())};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k()})();
