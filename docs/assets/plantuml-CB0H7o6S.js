function d(l){const a=new TextEncoder().encode(l);let n="";for(let t=0;t<a.length;t++)n+=a[t].toString(16).padStart(2,"0");return"h"+n}async function s(l,o,a="https://www.plantuml.com/plantuml"){const n=d(l),t=`${a}/svg/~${n}`;let e="";try{const r=await fetch(t,{cache:"no-cache"});r.ok?(e=await r.text(),e.includes("<svg")?e=e.replace("<svg",'<svg style="max-width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"'):e="<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de rendu PlantUML<br><small>Le serveur n'a pas retourné de SVG valide</small></div>"):e=`<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de rendu PlantUML<br><small>Code HTTP: ${r.status}</small></div>`}catch(r){e=`<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de connexion au serveur PlantUML<br><small>${r instanceof Error?r.message:"Erreur inconnue"}</small></div>`}return`
    <div class="plantuml-page-container" style="padding: 20px;">
      <div style="margin-bottom: 20px;">
        <a href="#" onclick="history.back(); return false;" style="color: #0366d6; text-decoration: none;">
          ← Retour
        </a>
      </div>
      <h1>${o}</h1>
      <div class="plantuml-diagram-wrapper" style="text-align: center; margin: 20px 0;">
        ${e}
      </div>
      <details style="margin-top: 30px; padding: 15px; background: #f6f8fa; border-radius: 6px;">
        <summary style="cursor: pointer; font-weight: bold;">📄 Code source PlantUML</summary>
        <pre style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #e1e4e8; border-radius: 3px; overflow-x: auto;"><code>${l.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>
      </details>
      <div style="margin-top: 20px; padding: 10px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
        <strong>✨ Avantages du SVG</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>Zoom infini sans perte de qualité (format vectoriel)</li>
          <li>Hyperliens cliquables dans le diagramme</li>
          <li>Texte sélectionnable et copiable</li>
        </ul>
      </div>
    </div>
  `}async function i(l,o){const a=o.endsWith(".puml")?o:o+".puml";for(const n of l){const t=n.root.replace(/\/$/,""),e=t===""||t==="/"?a:t+a;console.log("[loadPlantUML] Trying URL:",e);try{const r=await fetch(e,{cache:"no-cache"});if(r.ok)return console.log("[loadPlantUML] Success:",e),await r.text()}catch(r){console.log("[loadPlantUML] Fetch error:",r)}}return console.log("[loadPlantUML] File not found:",o),null}export{d as encodePlantUML,i as loadPlantUML,s as renderPlantUMLSVG};
