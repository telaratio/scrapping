<!-- Script de la page -->
<script>
    // Import des dépendances nécessaires
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Variables réactives
    let loading = true;
    let error = '';
    let success = false;

    // Fonction de vérification de l'email
    async function verifyEmail(token) {
        try {
            const response = await fetch(`/api/auth/verify-email?token=${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la vérification');
            }

            success = true;
            // Redirection après 3 secondes
            setTimeout(() => goto('/login'), 3000);

        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    // Vérification automatique au chargement de la page
    onMount(() => {
        const token = $page.url.searchParams.get('token');
        if (token) {
            verifyEmail(token);
        } else {
            error = 'Token de vérification manquant';
            loading = false;
        }
    });
</script>

<!-- Template de la page -->
<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Vérification de votre email
        </h2>

        {#if loading}
            <div class="mt-8">
                <svg class="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-lg text-gray-600">Vérification en cours...</p>
            </div>
        {:else if error}
            <div class="mt-8">
                <div class="rounded-md bg-red-50 p-4">
                    <div class="text-sm text-red-700">
                        {error}
                    </div>
                </div>
                <div class="mt-4">
                    <a href="/login" class="text-indigo-600 hover:text-indigo-500">
                        Retour à la page de connexion
                    </a>
                </div>
            </div>
        {:else if success}
            <div class="mt-8">
                <div class="rounded-md bg-green-50 p-4">
                    <div class="text-sm text-green-700">
                        Email vérifié avec succès ! Redirection en cours...
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div> 