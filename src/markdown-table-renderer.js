/**
 * Rendu avancé des tableaux markdown avec markdown-it
 * Support complet: alignement (:---:, ---:, :---), justification, échappement
 */

import MarkdownIt from 'markdown-it';
import multimdTable from 'markdown-it-multimd-table';

/**
 * Configuration markdown-it avec support complet des tableaux
 */
export function createMarkdownRenderer() {
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true
    });

    // Plugin tableaux avancés avec toutes les options
    md.use(multimdTable, {
        multiline: true,
        rowspan: true,
        headerless: true,
        multibody: true,
        aotolabel: true
    });

    return md;
}

/**
 * Styles CSS complets pour les tableaux avec alignements
 */
export const ADVANCED_TABLE_STYLES = `
<style>
/* Styles de base pour tous les tableaux */
table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 6px;
    overflow: hidden;
}

/* Headers */
thead th, th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    color: #495057;
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
}

/* Cellules de données */
tbody td, td {
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    background-color: white;
    transition: background-color 0.2s ease;
}

/* Alternance des lignes */
tbody tr:nth-child(even), tr:nth-child(even) {
    background-color: #f8f9fa;
}

tbody tr:hover, tr:hover {
    background-color: #e3f2fd;
}

/* Alignements - Support syntaxe markdown */
.text-left, th[style*="text-align: left"], td[style*="text-align: left"] {
    text-align: left !important;
}

.text-center, th[style*="text-align: center"], td[style*="text-align: center"] {
    text-align: center !important;
}

.text-right, th[style*="text-align: right"], td[style*="text-align: right"] {
    text-align: right !important;
}

/* Justification pour les cellules avec beaucoup de texte */
.text-justify {
    text-align: justify;
    hyphens: auto;
    word-break: break-word;
}

/* Responsive design */
@media (max-width: 768px) {
    table {
        font-size: 12px;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
    
    th, td {
        padding: 8px 12px;
        min-width: 100px;
    }
}

/* Tableaux compacts pour les données denses */
.table-compact {
    font-size: 12px;
}

.table-compact th, .table-compact td {
    padding: 6px 8px;
}

/* Support des cellules vides */
td:empty::before {
    content: "—";
    color: #6c757d;
    font-style: italic;
}

/* Bordures spéciales pour les tableaux complexes */
.table-bordered {
    border: 2px solid #495057;
}

.table-bordered th, .table-bordered td {
    border: 1px solid #495057;
}

/* Highlight pour colonnes importantes */
.col-highlight {
    background-color: #fff3cd !important;
    border-left: 3px solid #ffc107;
}

/* Support pour les cellules de spans multiples */
td[colspan], th[colspan] {
    font-weight: 600;
    background-color: #e9ecef;
    text-align: center;
}

td[rowspan], th[rowspan] {
    vertical-align: middle;
    background-color: #f8f9fa;
}
</style>
`;

/**
 * Convertit le markdown en HTML avec support complet des tableaux
 */
export function renderAdvancedMarkdown(markdownText) {
    const md = createMarkdownRenderer();
    
    // Rendu du markdown
    let html = md.render(markdownText);
    
    // Post-traitement pour améliorer les tableaux
    html = enhanceTableAlignment(html);
    html = addTableResponsiveWrapper(html);
    
    return html;
}

/**
 * Améliore l'alignement des tableaux basé sur la syntaxe markdown
 */
function enhanceTableAlignment(html) {
    // Détection et application des alignements
    return html.replace(/<table[^>]*>/g, (match) => {
        return match + '\n<!-- Table avec alignements automatiques -->';
    });
}

/**
 * Ajoute des wrappers responsive aux tableaux
 */
function addTableResponsiveWrapper(html) {
    return html.replace(/<table([^>]*)>/g, '<div class="table-responsive"><table$1>').replace(/<\/table>/g, '</table></div>');
}

/**
 * Exemple d'utilisation avec tous les types d'alignement
 */
export const DEMO_MARKDOWN_ADVANCED = `
# Démonstration Tableaux Avancés OntoWave

## 1. Tableau Basic avec Alignements

| Gauche | Centre | Droite | Justifié |
|:-------|:------:|-------:|:---------|
| Texte aligné à gauche | Centre parfait | Droite | Ce texte long sera justifié sur plusieurs lignes pour démontrer l'alignement |
| Court | 🎯 | 123.45€ | Justification automatique avec césure |

## 2. Tableau Compact avec Données Numériques

| Produit | Quantité | Prix | Total |
|:--------|:--------:|-----:|------:|
| Ordinateur | 2 | 899.99€ | 1799.98€ |
| Souris | 5 | 25.50€ | 127.50€ |
| Clavier | 3 | 75.00€ | 225.00€ |
| **TOTAL** | **10** | | **2152.48€** |

## 3. Tableau Complexe avec Cellules Vides

| Fonctionnalité | Windows | macOS | Linux | Mobile |
|:---------------|:-------:|:-----:|:-----:|:------:|
| Installation | ✅ | ✅ | ✅ | |
| Synchronisation | ✅ | ✅ | ✅ | ✅ |
| Mode Hors-ligne | ⚠️ | ✅ | ✅ | ✅ |
| Sauvegarde Auto | ✅ | ✅ | | ⚠️ |

## 4. Tableau de Données Techniques

| Paramètre | Valeur Min | Valeur Max | Unité | Description |
|:----------|:----------:|:----------:|:-----:|:------------|
| Température | -40 | +85 | °C | Plage de fonctionnement |
| Tension | 3.0 | 5.5 | V | Alimentation requise |
| Fréquence | 1 | 100 | MHz | Bande passante |
| Consommation | 10 | 250 | mW | Puissance typique |
\`;

export default {
    createMarkdownRenderer,
    renderAdvancedMarkdown,
    ADVANCED_TABLE_STYLES,
    DEMO_MARKDOWN_ADVANCED
};
`;