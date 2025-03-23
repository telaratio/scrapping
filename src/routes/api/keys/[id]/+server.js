import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

/**
 * PATCH /api/keys/:id
 * Active ou désactive une clé API
 */
export async function PATCH({ params, request, locals }) {
    try {
        // Vérification de l'authentification via hooks.server.js
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return json({ error: 'ID invalide' }, { status: 400 });
        }

        // Récupération et validation du nouvel état
        const { actif } = await request.json();
        if (typeof actif !== 'boolean') {
            return json({ error: 'État invalide' }, { status: 400 });
        }

        // Vérification et mise à jour de la clé
        const cleExistante = await prisma.cleApi.findFirst({
            where: {
                id,
                utilisateur_id: locals.user.id
            }
        });

        if (!cleExistante) {
            return json({ error: 'Clé non trouvée' }, { status: 404 });
        }

        const cleModifiee = await prisma.cleApi.update({
            where: { id },
            data: { 
                actif,
                date_modification: new Date()
            }
        });

        return json({
            id: cleModifiee.id,
            nom: cleModifiee.nom,
            actif: cleModifiee.actif,
            date_modification: cleModifiee.date_modification
        });

    } catch (error) {
        console.error('Erreur lors de la modification de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * DELETE /api/keys/:id
 * Supprime une clé API
 */
export async function DELETE({ params, locals }) {
    try {
        // Vérification de l'authentification via hooks.server.js
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return json({ error: 'ID invalide' }, { status: 400 });
        }

        // Vérification et suppression de la clé
        const cleExistante = await prisma.cleApi.findFirst({
            where: {
                id,
                utilisateur_id: locals.user.id
            }
        });

        if (!cleExistante) {
            return json({ error: 'Clé non trouvée' }, { status: 404 });
        }

        await prisma.cleApi.delete({
            where: { id }
        });

        return json({ success: true });

    } catch (error) {
        console.error('Erreur lors de la suppression de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 