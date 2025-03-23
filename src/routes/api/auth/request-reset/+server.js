import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { generateToken, sendPasswordResetEmail } from '$lib/server/email';

export async function POST({ request }) {
    try {
        const { email } = await request.json();

        if (!email) {
            return json({
                success: false,
                message: 'Email requis'
            }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.utilisateur.findUnique({
            where: { email }
        });

        // Always return success even if user not found (security best practice)
        if (!user) {
            return json({
                success: true,
                message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'
            });
        }

        // Generate reset token
        const resetToken = generateToken();
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Update user with reset token
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
                token_reset_mdp: resetToken,
                date_expiration_reset: resetExpiry
            }
        });

        // Send reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', emailError);
            return json({
                success: false,
                message: 'Erreur lors de l\'envoi de l\'email'
            }, { status: 500 });
        }

        return json({
            success: true,
            message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'
        });

    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        return json({
            success: false,
            message: 'Erreur serveur lors de la demande de réinitialisation'
        }, { status: 500 });
    }
} 