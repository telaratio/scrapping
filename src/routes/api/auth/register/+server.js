import argon2 from 'argon2';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { createJWT } from '$lib/server/auth';
import { generateToken, sendVerificationEmail } from '$lib/server/email';

/**
 * Valide le format d'un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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

/**
 * Endpoint POST pour l'inscription des utilisateurs
 * @param {Request} request - La requête HTTP
 * @returns {Response} Réponse JSON avec le token et les informations utilisateur
 */
export async function POST({ request }) {
    try {

        // Extraction des données de la requête
        const body = await request.json();
        console.log('Données reçues:', { ...body, password: '***' });
        
        const { email, password, name } = body;

        // Vérification des champs requis
        if (!email || !password || !name) {
            return json({
                success: false,
                message: 'Tous les champs sont requis'
            }, { status: 400 });
        }

        // Validation de l'email
        if (!isValidEmail(email)) {
            return json({
                success: false,
                message: 'Format d\'email invalide'
            }, { status: 400 });
        }

        // Validation du mot de passe
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return json({
                success: false,
                message: passwordValidation.message
            }, { status: 400 });
        }

        // Validation du nom
        if (name.length < 2) {
            return json({
                success: false,
                message: 'Le nom doit contenir au moins 2 caractères'
            }, { status: 400 });
        }

        console.log('Vérification de l\'unicité de l\'email');
        // Vérification de l'unicité de l'email
        const existingUser = await prisma.utilisateur.findUnique({
            where: { email }
        });

        if (existingUser) {
            return json({
                success: false,
                message: 'Cet email est déjà utilisé'
            }, { status: 400 });
        }

        // Génération du token de vérification
        const verificationToken = generateToken();

        // Hachage du mot de passe avec Argon2
        const hashedPassword = await argon2.hash(password);

        // Création du nouvel utilisateur
        const user = await prisma.utilisateur.create({
            data: {
                email,
                mot_de_passe: hashedPassword,
                nom: name,
                token_verification: verificationToken,
                date_creation: new Date()
            }
        });

        // Envoi de l'email de vérification
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
            // On continue malgré l'erreur d'envoi d'email
        }

        // Génération du token JWT
        const token = createJWT(user);

        // Retour de la réponse avec le token et les informations utilisateur
        return json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                email_verifie: false
            },
            message: 'Inscription réussie. Veuillez vérifier votre email.'
        });

    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur détaillée lors de l\'inscription:', error);
        return json({
            success: false,
            message: error.message || 'Erreur serveur lors de l\'inscription'
        }, { status: 500 });
    }
} 