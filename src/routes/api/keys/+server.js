import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { generateApiKey } from '$lib/server/utils/apiKeyGenerator';

/**
 * GET /api/keys
 * Liste les clés API de l'utilisateur avec leurs statistiques
 */
export async function GET({ request, locals }) {
    try {
        // Vérification de l'authentification via hooks.server.js
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Récupération des clés avec leurs statistiques
        const cles = await prisma.cleApi.findMany({
            where: {
                utilisateur_id: locals.user.id
            },
            include: {
                _count: {
                    select: {
                        logs_scraping: {
                            where: {
                                date_creation: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
                                }
                            }
                        }
                    }
                },
                logs_scraping: {
                    take: 1,
                    orderBy: {
                        date_creation: 'desc'
                    },
                    select: {
                        date_creation: true
                    }
                }
            }
        });

        // Formatage de la réponse
        const clesFormatees = cles.map(cle => ({
            id: cle.id,
            nom: cle.nom,
            cle: cle.cle,
            actif: cle.actif,
            date_creation: cle.date_creation,
            date_modification: cle.date_modification,
            derniere_utilisation: cle.logs_scraping[0]?.date_creation || null,
            utilisation_30_jours: cle._count.logs_scraping
        }));

        return json(clesFormatees);

    } catch (error) {
        console.error('Erreur lors de la récupération des clés API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/keys
 * Crée une nouvelle clé API
 */
export async function POST({ request, locals }) {
    try {
        // Vérification de l'authentification via hooks.server.js
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Récupération et validation du nom
        const { nom } = await request.json();
        if (!nom || typeof nom !== 'string' || nom.length < 3) {
            return json({ error: 'Nom invalide (minimum 3 caractères)' }, { status: 400 });
        }

        // Vérification du nombre maximum de clés (limite à 5 par utilisateur)
        const nbCles = await prisma.cleApi.count({
            where: { utilisateur_id: locals.user.id }
        });

        if (nbCles >= 5) {
            return json({ error: 'Nombre maximum de clés atteint (5)' }, { status: 400 });
        }

        // Génération de la clé API
        const cle = generateApiKey();

        // Création de la clé en base
        const nouvelleCle = await prisma.cleApi.create({
            data: {
                nom,
                cle,
                utilisateur_id: locals.user.id
            }
        });

        return json({
            id: nouvelleCle.id,
            nom: nouvelleCle.nom,
            cle: nouvelleCle.cle,
            actif: nouvelleCle.actif,
            date_creation: nouvelleCle.date_creation,
            date_modification: nouvelleCle.date_modification
        });

    } catch (error) {
        console.error('Erreur lors de la création de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * PATCH /api/keys/:id
 * Active ou désactive une clé API
 */
export async function PATCH({ params, request, locals }) {
    try {
        // Vérification de l'authentification
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { id } = params;
        if (!id || isNaN(parseInt(id))) {
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
                id: parseInt(id),
                utilisateur_id: locals.user.id
            }
        });

        if (!cleExistante) {
            return json({ error: 'Clé non trouvée' }, { status: 404 });
        }

        const cleModifiee = await prisma.cleApi.update({
            where: { id: parseInt(id) },
            data: { actif }
        });

        return json({
            id: cleModifiee.id,
            nom: cleModifiee.nom,
            actif: cleModifiee.actif
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
        // Vérification de l'authentification
        if (!locals.user) {
            return json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { id } = params;
        if (!id || isNaN(parseInt(id))) {
            return json({ error: 'ID invalide' }, { status: 400 });
        }

        // Vérification et suppression de la clé
        const cleExistante = await prisma.cleApi.findFirst({
            where: {
                id: parseInt(id),
                utilisateur_id: locals.user.id
            }
        });

        if (!cleExistante) {
            return json({ error: 'Clé non trouvée' }, { status: 404 });
        }

        await prisma.cleApi.delete({
            where: { id: parseInt(id) }
        });

        return json({ success: true });

    } catch (error) {
        console.error('Erreur lors de la suppression de la clé API:', error);
        return json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 