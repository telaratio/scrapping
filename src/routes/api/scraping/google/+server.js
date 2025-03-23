import { json } from '@sveltejs/kit';
import { googleSerpScraper } from '$lib/server/services/googleSerpScraper.js';

/**
 * Endpoint pour tester le scraping Google SERP
 */
export async function POST({ request }) {
    try {
        const { keyword } = await request.json();

        if (!keyword) {
            return json({
                status: 'error',
                error: 'Mot-clé manquant'
            }, { status: 400 });
        }

        // Extraction et structuration des résultats
        const results = await googleSerpScraper.scrape(keyword);

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