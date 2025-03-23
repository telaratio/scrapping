import { load } from 'cheerio';

/**
 * Service d'extraction de structure HTML
 * Transforme le HTML brut en format structuré optimisé pour l'analyse
 */
export class HtmlStructureExtractor {
    constructor() {
        // Configuration des éléments à extraire
        this.relevantTags = {
            headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            text: ['p', 'blockquote', 'span'],
            lists: ['ul', 'ol'],
            listItems: ['li'],
            links: ['a'],
            tables: ['table', 'tr', 'td', 'th']
        };
    }

    /**
     * Transforme le HTML en format structuré
     * @param {string} html - Le HTML brut à transformer
     * @returns {string} Le contenu structuré
     */
    extract(html) {
        try {
            const $ = load(html, { decodeEntities: true });
            let output = [];
            
            // Fonction récursive pour traiter les éléments
            const processElement = (element) => {
                const $el = $(element);
                const tagName = element.tagName?.toLowerCase();
                
                // Ignorer les scripts, styles, images et commentaires
                if (tagName === 'script' || tagName === 'style' || tagName === 'img' || element.type === 'comment') {
                    return;
                }

                // Traitement des titres
                if (this.relevantTags.headings.includes(tagName)) {
                    const text = $el.text().trim();
                    if (text) {
                        output.push(`${'\n'.repeat(2)}${tagName.toUpperCase()}: ${text}`);
                    }
                }
                
                // Traitement des paragraphes, citations et spans
                else if (tagName === 'p' || tagName === 'blockquote' || tagName === 'span') {
                    const text = $el.text().trim();
                    if (text) {
                        // Ne pas traiter les spans qui sont déjà dans un paragraphe ou une citation
                        if (tagName === 'span' && $el.parents('p, blockquote').length > 0) {
                            return;
                        }
                        
                        if (tagName === 'blockquote') {
                            output.push(`${'\n'.repeat(2)}Citation: "${text}"`);
                        } else {
                            output.push(`${'\n'}${text}`);
                        }
                    }
                }
                
                // Traitement des listes
                else if (this.relevantTags.lists.includes(tagName)) {
                    output.push('\n'); // Espace avant la liste
                    const isOrdered = tagName === 'ol';
                    let itemNumber = 1;
                    
                    $el.children('li').each((_, li) => {
                        const $li = $(li);
                        const text = $li.text().trim();
                        if (text) {
                            const prefix = isOrdered ? `${itemNumber}. ` : '• ';
                            output.push(`${prefix}${text}`);
                            itemNumber++;
                        }
                        
                        // Traitement des sous-listes
                        $li.children('ul, ol').each((_, subList) => {
                            const $subList = $(subList);
                            const isSubOrdered = subList.tagName.toLowerCase() === 'ol';
                            let subItemNumber = 1;
                            
                            $subList.children('li').each((_, subLi) => {
                                const text = $(subLi).text().trim();
                                if (text) {
                                    const prefix = isSubOrdered ? `   ${subItemNumber}. ` : '   • ';
                                    output.push(`${prefix}${text}`);
                                    subItemNumber++;
                                }
                            });
                        });
                    });
                }
                
                // Traitement des liens
                else if (tagName === 'a') {
                    const href = $el.attr('href');
                    const text = $el.text().trim();
                    if (text && href && !href.startsWith('#')) {
                        // Ne pas dupliquer si déjà dans un autre élément
                        if (!$el.parents(Object.values(this.relevantTags).flat().join(',')).length) {
                            output.push(`${'\n'}Lien: ${text} (${href})`);
                        }
                    }
                }
                
                // Traitement des tableaux
                else if (tagName === 'table') {
                    output.push('\n\nTableau:');
                    $el.find('tr').each((_, row) => {
                        const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
                        if (cells.length) {
                            output.push(`\n${cells.join(' | ')}`);
                        }
                    });
                }
                
                // Traitement récursif des enfants
                else {
                    $el.contents().each((_, child) => processElement(child));
                }
            };

            // Traitement initial du body
            $('body').contents().each((_, element) => processElement(element));

            // Nettoyage final
            return this.cleanOutput(output.join(''));
        } catch (error) {
            console.error('Erreur lors de l\'extraction de la structure:', error);
            throw new Error(`Échec de l'extraction: ${error.message}`);
        }
    }

    /**
     * Nettoie la sortie finale
     * @param {string} text - Le texte à nettoyer
     * @returns {string} Le texte nettoyé
     */
    cleanOutput(text) {
        return text
            .replace(/[\n]{3,}/g, '\n\n') // Limite les sauts de ligne consécutifs
            .replace(/\s+/g, ' ') // Normalise les espaces
            .trim() // Supprime les espaces aux extrémités
            .split('\n') // Traite ligne par ligne
            .map(line => line.trim()) // Nettoie chaque ligne
            .filter(line => line) // Supprime les lignes vides
            .join('\n'); // Recompose le texte
    }
}

// Export d'une instance unique
export const htmlStructureExtractor = new HtmlStructureExtractor(); 