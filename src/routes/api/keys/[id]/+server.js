import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJWT } from '$lib/server/auth';

// PATCH /api/keys/[id] - Mettre à jour une clé API
export async function PATCH({ params, request, cookies }) {
    console.log('PATCH /api/keys/[id] - cookies:', cookies.getAll());
    console.log('PATCH /api/keys/[id] - params:', params);
    
    // Récupérer le token depuis les cookies
    const token = cookies.get('jwt');
    console.log('PATCH /api/keys/[id] - token:', token);

    if (!token) {
        console.log('PATCH /api/keys/[id] - Non autorisé: pas de token');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le token
    const userData = verifyJWT(token);
    console.log('PATCH /api/keys/[id] - userData:', userData);

    if (!userData) {
        console.log('PATCH /api/keys/[id] - Non autorisé: token invalide');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { actif } = await request.json();
        console.log('PATCH /api/keys/[id] - Données reçues:', { actif });
        
        if (typeof actif !== 'boolean') {
            console.log('PATCH /api/keys/[id] - Erreur: actif doit être un booléen');
            return json({ error: 'Le statut actif doit être un booléen' }, { status: 400 });
        }

        const key = await prisma.cleApi.findFirst({
            where: {
                id: parseInt(params.id),
                utilisateur_id: userData.id
            }
        });

        if (!key) {
            console.log('PATCH /api/keys/[id] - Clé non trouvée');
            return json({ error: 'Clé API non trouvée' }, { status: 404 });
        }

        console.log('PATCH /api/keys/[id] - Clé trouvée:', key);

        const updatedKey = await prisma.cleApi.update({
            where: {
                id: parseInt(params.id)
            },
            data: {
                actif
            }
        });

        console.log('PATCH /api/keys/[id] - Clé mise à jour:', updatedKey);
        return json(updatedKey);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE /api/keys/[id] - Supprimer une clé API
export async function DELETE({ params, cookies }) {
    console.log('DELETE /api/keys/[id] - cookies:', cookies.getAll());
    console.log('DELETE /api/keys/[id] - params:', params);
    
    // Récupérer le token depuis les cookies
    const token = cookies.get('jwt');
    console.log('DELETE /api/keys/[id] - token:', token);

    if (!token) {
        console.log('DELETE /api/keys/[id] - Non autorisé: pas de token');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le token
    const userData = verifyJWT(token);
    console.log('DELETE /api/keys/[id] - userData:', userData);

    if (!userData) {
        console.log('DELETE /api/keys/[id] - Non autorisé: token invalide');
        return json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const key = await prisma.cleApi.findFirst({
            where: {
                id: parseInt(params.id),
                utilisateur_id: userData.id
            }
        });

        if (!key) {
            console.log('DELETE /api/keys/[id] - Clé non trouvée');
            return json({ error: 'Clé API non trouvée' }, { status: 404 });
        }

        console.log('DELETE /api/keys/[id] - Clé trouvée:', key);

        await prisma.cleApi.delete({
            where: {
                id: parseInt(params.id)
            }
        });

        console.log('DELETE /api/keys/[id] - Clé supprimée avec succès');
        return json({ message: 'Clé API supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
