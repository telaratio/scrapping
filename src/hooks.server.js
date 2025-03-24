// Import des dépendances
import { verifyJWT } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

/**
 * Liste des routes publiques qui ne nécessitent pas d'authentification
 */
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-email',
    '/api/auth/request-reset',
    '/api/auth/reset-password',
    '/api/scraping/auth/webpage',
    '/api/scraping/auth/google'
];

/**
 * Vérifie si une route est publique
 * @param {string} path - Chemin de la route
 * @returns {boolean} True si la route est publique
 */
function isPublicRoute(path) {
    return publicRoutes.some(route => path.startsWith(route));
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const path = event.url.pathname;
    
    // Si ce n'est pas une route publique, vérifier l'authentification
    if (!isPublicRoute(path)) {
        // Récupérer le token des cookies ou du header Authorization
        const authHeader = event.request.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : event.cookies.get('jwt');
        
        if (!token) {
            console.log(`Accès refusé à ${path}: Pas de token`);
            throw redirect(303, '/login');
        }

        // Vérifier le token
        const userData = verifyJWT(token);
        if (!userData) {
            console.log(`Accès refusé à ${path}: Token invalide`);
            throw redirect(303, '/login');
        }

        // Ajouter l'utilisateur à l'event
        event.locals.user = userData;
        console.log(`Accès autorisé à ${path} pour l'utilisateur ${userData.email}`);
    }

    const response = await resolve(event);
    return response;
} 