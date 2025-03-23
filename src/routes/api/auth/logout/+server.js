import { json } from '@sveltejs/kit';

/**
 * Endpoint POST pour la déconnexion des utilisateurs
 * @param {Object} params - Les paramètres de la requête
 * @param {Object} params.cookies - Les cookies de la requête
 * @returns {Response} Réponse JSON confirmant la déconnexion
 */
export async function POST({ cookies }) {
    // Suppression du cookie JWT
    cookies.delete('jwt', { path: '/' });
    
    return json({
        success: true,
        message: 'Déconnexion réussie'
    });
} 