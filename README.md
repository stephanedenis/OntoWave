# OntoWave (MVP)

Un mini site statique type « mdwiki » moderne, sans build documentaire, qui rend des fichiers Markdown côté client.

Principes:
- Aucune compilation de contenu: les `.md` sont chargés via `fetch` et rendus côté navigateur.
- Router hash (`#/chemin`) pour l’hébergement statique (GitHub Pages, S3, Nginx…).
- Racines de contenu configurables (permet de mapper des sous-arborescences ou des submodules).
- Rendu Markdown avec markdown-it, titres ancrés, code surligné, Mermaid et KaTeX.
- Optionnel: génération d’un `sitemap.json` (outil Node) pour la recherche ou la navigation.

## Démarrage

```bash
cd ontowave
npm install
npm run dev
```

Déploiement:
```bash
npm run build
npm run preview # ou servez le dossier dist/ sur Pages
```

## Structure
- `public/config.json`: configuration des racines de contenu (par défaut `content/`).
- `content/`: vos fichiers Markdown (exemples fournis).
- `src/`: app Vite (TypeScript), router et rendu Markdown.
- `tools/build-sitemap.mjs`: génère `public/sitemap.json` en scannant les racines.

## Intégration submodules
Publiez/recopiez vos sous-modules vers des répertoires montés comme racines de `config.json` (ex: `RESEARCH/`). L’app les servira tels quels et gérera les liens `.md` → routes `#/…`.

## GitHub Pages et DNS (custom domain)

1) Config Pages
- Repo ➜ Settings ➜ Pages ➜ Build and deployment: Deploy from a branch
- Branch: `main`, Folder: `/docs`
- Custom domain: `ontowave.dev` (ou votre domaine). Le fichier `docs/CNAME` est pris en compte.

2) DNS requis côté registrar
- Créez un enregistrement A (si apex/root):
	- `@` ➜ 185.199.108.153
	- `@` ➜ 185.199.109.153
	- `@` ➜ 185.199.110.153
	- `@` ➜ 185.199.111.153
- Et/ou un CNAME (pour un sous-domaine, ex: `www`):
	- `www` ➜ `<username>.github.io` (ex: `stephanedenis.github.io`)

3) HTTPS
- Dans Settings ➜ Pages, cochez "Enforce HTTPS" après propagation DNS.

4) Domaines alternatifs (.net/.com, www)
- Vous avez indiqué que `ontowawe.net`, `www.ontowave.net`, `ontowave.com` et `www.ontowave.com` pointent en CNAME vers `stephanedenis.github.io`.
- Pour un domaine canonique unique, ce projet utilise `ontowave.com` (voir `docs/CNAME`).
- Recommandation: laissez GitHub Pages gérer les redirections HTTPS (une seule entrée CNAME côté Pages). Si besoin, une redirection côté client existe dans `index.html` pour les hôtes alternatifs vers `https://ontowave.com`.

5) Validation / état actuel
- Projet configuré pour produire `docs/` (Vite outDir) et inclut `docs/CNAME` et `docs/.nojekyll`.
- Reste à faire côté compte GitHub: activer Pages sur `main/docs` et saisir le domaine custom `ontowave.com`.
- Reste à faire côté registrar: créer les enregistrements A/CNAME ci-dessus vers GitHub Pages.

6) Déploiement
- Chaque push sur `main` met à jour `docs/`; Pages sert la dernière version.
- Option: ajouter un workflow d’upload artefact si vous souhaitez conserver un build de référence.
***

Limitations MVP:
- Pas d’indexation de recherche (prévue via `sitemap.json` + Web Worker elasticlunr).
- Sécurité XSS: le contenu est supposé de confiance. Ajoutez DOMPurify si nécessaire.

## Recherche (SPA, opt-in)

- L’index est inactif par défaut si aucun `search-index.json` n’est présent (à côté d’`index.html`).
- Activez-le via le panneau « Options » (mini-menu flottant), importez un `pages.txt` (liste de chemins `.md` relatifs aux racines), laissez l’index se construire, puis exportez `search-index.json`.
- En build, `npm run pageslist` génère automatiquement `public/pages.txt`; vous pouvez ensuite ouvrir le site, activer l’index, puis exporter.
- La recherche privilégie la langue courante (préfixe `#/fr/` ou `#/en/`), avec repli inter-langue si aucun résultat.

### Déploiement « copie statique »

Pour un usage sans pipeline (copie d’`index.html` + `assets` + `config.json` + contenus):

- Placez `config.json`, `nav.yml` (optionnel) et `sitemap.json`/`pages.txt` à côté d’`index.html`.
- Si vous ne voulez pas d’indexation en ligne, exportez `search-index.json` depuis le panneau Options et copiez-le avec le site.
- Optionnel: réduisez l’habillage via `ui` dans `public/config.json`:
	- `"ui": { "minimal": true }` pour masquer header/sidebar/toc/footer.
	- Ou au détail: `header:false`, `sidebar:false`, `toc:false`, `footer:false`, `menu:false`.
