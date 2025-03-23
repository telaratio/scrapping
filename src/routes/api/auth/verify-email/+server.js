// Import des dépendances nécessaires
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

/**
 * Endpoint GET pour vérifier l'email d'un utilisateur
 * @param {Object} params - Les paramètres de la requête
 * @param {URLSearchParams} params.url.searchParams - Les paramètres de l'URL
 * @returns {Response} Réponse JSON indiquant le succès ou l'échec de la vérification
 */
export async function GET({ url }) {
    try {
        // Récupération du token depuis les paramètres de l'URL
        const token = url.searchParams.get('token');

        // Vérification de la présence du token
        if (!token) {
            return json({
                success: false,
                message: 'Token de vérification manquant'
            }, { status: 400 });
        }

        // Recherche de l'utilisateur avec ce token
        const user = await prisma.utilisateur.findUnique({
            where: { token_verification: token }
        });

        // Vérification de l'existence de l'utilisateur
        if (!user) {
            return json({
                success: false,
                message: 'Token de vérification invalide ou expiré'
            }, { status: 400 });
        }

        // Mise à jour du statut de vérification de l'utilisateur
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
                email_verifie: true,
                token_verification: null // Suppression du token après utilisation
            }
        });

        // Retour de la réponse de succès
        return json({
            success: true,
            message: 'Email vérifié avec succès'
        });

    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur lors de la vérification de l\'email:', error);
        return json({
            success: false,
            message: 'Erreur serveur lors de la vérification de l\'email'
        }, { status: 500 });
    }
} 