import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import argon2 from 'argon2';

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
    }
    return { isValid: true };
}

export async function POST({ request }) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return json({
                success: false,
                message: 'Token et nouveau mot de passe requis'
            }, { status: 400 });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return json({
                success: false,
                message: passwordValidation.message
            }, { status: 400 });
        }

        // Find user with valid reset token
        const user = await prisma.utilisateur.findFirst({
            where: {
                token_reset_mdp: token,
                date_expiration_reset: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return json({
                success: false,
                message: 'Token de réinitialisation invalide ou expiré'
            }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await argon2.hash(password);

        // Update user password and clear reset token
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
                mot_de_passe: hashedPassword,
                token_reset_mdp: null,
                date_expiration_reset: null
            }
        });

        return json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        return json({
            success: false,
            message: 'Erreur serveur lors de la réinitialisation du mot de passe'
        }, { status: 500 });
    }
} 