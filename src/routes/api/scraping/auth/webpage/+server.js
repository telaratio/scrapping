import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { webScraper } from '$lib/server/services/webScraper.js';

// Indique que cet endpoint peut être accédé sans JWT
export const config = {
    public: true
};

/**
 * POST /api/scraping/auth/webpage
 * Endpoint authentifié pour le scraping d'une URL
 */
export async function POST({ request }) {
    const startTime = Date.now();
    let apiKey = null;
    let requestUrl = '';

    try {
        // Vérification de l'authentification par clé API
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json({ error: 'Clé API manquante' }, { status: 401 });
        }

        // Extraction et vérification de la clé API
        const key = authHeader.split('Bearer ')[1];
        apiKey = await prisma.cleApi.findFirst({
            where: {
                cle: key,
                actif: true
            },
            include: {
                utilisateur: true
            }
        });

        if (!apiKey) {
            return json({ error: 'Clé API invalide ou inactive' }, { status: 401 });
        }

        // Vérification que l'utilisateur associé existe et est actif
        if (!apiKey.utilisateur || !apiKey.utilisateur.actif) {
            return json({ error: 'Utilisateur invalide ou inactif' }, { status: 401 });
        }

        // Récupération et validation de l'URL
        const { url } = await request.json();
        requestUrl = url;
        if (!url) {
            return json({ error: 'URL requise' }, { status: 400 });
        }

        try {
            new URL(url);
        } catch (e) {
            return json({ error: 'URL invalide' }, { status: 400 });
        }

        // Extraction du contenu
        const results = await webScraper.scrapeUrl(url);

        // Assurer que les résultats sont sérialisables
        const safeResults = JSON.parse(JSON.stringify(results));

        // Enregistrement du log
        await prisma.logScraping.create({
            data: {
                type_scraping: 'WEBSITE',
                requete: url,
                statut: 'SUCCESS',
                donnees: safeResults, // Utilisation des résultats sérialisables
                cle_api_id: apiKey.id,
                utilisateur_id: apiKey.utilisateur.id
            }
        });

        return json({
            status: 'success',
            ...results
        });

    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        
        // Enregistrement du log en cas d'erreur
        if (apiKey && apiKey.utilisateur) {
            try {
                await prisma.logScraping.create({
                    data: {
                        type_scraping: 'WEBSITE',
                        requete: requestUrl || '',
                        statut: 'FAILED',
                        donnees: { error: error.message }, // Format JSON valide
                        cle_api_id: apiKey.id,
                        utilisateur_id: apiKey.utilisateur.id
                    }
                });
            } catch (logError) {
                console.error('Erreur lors de la création du log:', logError);
            }
        }

        return json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
}