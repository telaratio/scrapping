import { json } from '@sveltejs/kit';
import { webScraper } from '$lib/server/services/webScraper.js';

/**
 * POST /api/scraping/webpage
 * Endpoint pour extraire le HTML d'une page web
 */
export async function POST({ request }) {
    try {
        const { url } = await request.json();

        if (!url) {
            return json({
                status: 'error',
                error: 'URL manquante'
            }, { status: 400 });
        }

        // Validation basique de l'URL
        try {
            new URL(url);
        } catch (error) {
            return json({
                status: 'error',
                error: 'URL invalide'
            }, { status: 400 });
        }

        // Extraction et structuration du contenu
        const results = await webScraper.scrapeUrl(url);

        return json({
            status: 'success',
            ...results
        });

    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        return json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
} 