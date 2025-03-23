import argon2 from 'argon2';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { createJWT } from '$lib/server/auth';

// Pour hacher un mot de passe
try {
  const hash = await argon2.hash('mot_de_passe');
  // Stockez le hash dans votre base de données
  
  // Pour vérifier un mot de passe
  const isValid = await argon2.verify(hash, 'mot_de_passe');
} catch (err) {
  // Gérer l'erreur
}

/**
 * Endpoint POST pour la connexion des utilisateurs
 * @param {Request} request - La requête HTTP
 * @returns {Response} Réponse JSON avec le token et les informations utilisateur
 */
export async function POST({ request, cookies }) {
    try {
        // Extraction des données de la requête
        const { email, password } = await request.json();

        // Vérification des champs requis
        if (!email || !password) {
            return json({
                success: false,
                message: 'Email et mot de passe requis'
            }, { status: 400 });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await prisma.utilisateur.findUnique({
            where: { email }
        });

        // Vérification de l'existence de l'utilisateur
        if (!user) {
            return json({
                success: false,
                message: 'Identifiants invalides'
            }, { status: 401 });
        }

        // Vérification du mot de passe avec Argon2
        const isValidPassword = await argon2.verify(user.mot_de_passe, password);

        if (!isValidPassword) {
            return json({
                success: false,
                message: 'Identifiants invalides'
            }, { status: 401 });
        }

        // Vérification si l'email est vérifié
        if (!user.email_verifie) {
            return json({
                success: false,
                message: 'Veuillez vérifier votre email avant de vous connecter',
                needsVerification: true
            }, { status: 403 });
        }

        // Vérification si le compte est actif
        if (!user.actif) {
            return json({
                success: false,
                message: 'Ce compte a été désactivé'
            }, { status: 403 });
        }

        // Mise à jour de la date de dernière connexion
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: { derniere_connexion: new Date() }
        });

        // Génération du token JWT
        const token = createJWT(user);

        // Configuration du cookie
        cookies.set('jwt', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 heures
        });
        
        // Retour de la réponse avec les informations utilisateur
        return json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                role: user.role,
                email_verifie: user.email_verifie
            }
        });

    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur détaillée lors de la connexion:', error);
        return json({
            success: false,
            message: error.message || 'Erreur serveur lors de la connexion'
        }, { status: 500 });
    }
}
