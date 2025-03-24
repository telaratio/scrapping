import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { generateApiKey } from '$lib/server/utils/apiKeyGenerator';
import { verifyJWT } from '$lib/server/auth';

// GET /api/keys - Récupérer toutes les clés API de l'utilisateur
export async function GET({ request, cookies }) {
    console.log('GET /api/keys - cookies:', cookies.getAll());
    
    // Récupérer le token depuis les cookies
    const token = cookies.get('jwt');
    console.log('GET /api/keys - token:', token);

    if (!token) {
        console.log('GET /api/keys - Non autorisé: pas de token');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le token
    const userData = verifyJWT(token);
    console.log('GET /api/keys - userData:', userData);

    if (!userData) {
        console.log('GET /api/keys - Non autorisé: token invalide');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const keys = await prisma.cleApi.findMany({
            where: {
                utilisateur_id: userData.id
            },
            select: {
                id: true,
                cle: true,
                nom: true,
                actif: true,
                date_creation: true,
                date_modification: true
            }
        });

        console.log('GET /api/keys - Clés trouvées:', keys);
        return json(keys);
    } catch (error) {
        console.error('Erreur lors de la récupération des clés API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST /api/keys - Créer une nouvelle clé API
export async function POST({ request, cookies }) {
    console.log('POST /api/keys - cookies:', cookies.getAll());
    
    // Récupérer le token depuis les cookies
    const token = cookies.get('jwt');
    console.log('POST /api/keys - token:', token);

    if (!token) {
        console.log('POST /api/keys - Non autorisé: pas de token');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le token
    const userData = verifyJWT(token);
    console.log('POST /api/keys - userData:', userData);

    if (!userData) {
        console.log('POST /api/keys - Non autorisé: token invalide');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { nom } = await request.json();
        console.log('POST /api/keys - Données reçues:', { nom });
        
        if (!nom) {
            console.log('POST /api/keys - Erreur: nom manquant');
            return json({ error: 'Le nom est requis' }, { status: 400 });
        }

        const cle = generateApiKey();
        console.log('POST /api/keys - Nouvelle clé générée:', cle);
        
        const newKey = await prisma.cleApi.create({
            data: {
                cle,
                nom,
                utilisateur_id: userData.id
            }
        });

        console.log('POST /api/keys - Clé créée:', newKey);
        return json(newKey);
    } catch (error) {
        console.error('Erreur lors de la création de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
