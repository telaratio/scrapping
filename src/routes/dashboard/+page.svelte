<!-- Script de la page -->
<script>
    // Import des dépendances
    import { onMount } from 'svelte';
    import { user, checkAuth, logout } from '$lib/auth';
    import { goto } from '$app/navigation';

    // Vérification de l'authentification au chargement
    onMount(() => {
        if (!checkAuth()) {
            goto('/login');
        }
    });

    // Fonction de déconnexion
    function handleLogout() {
        logout();
    }
</script>

<!-- Template de la page -->
<div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-semibold">Set up authentification</h1>
                </div>
                <div class="flex items-center">
                    {#if $user}
                        <span class="text-gray-700 mr-4">Bienvenue, {$user.nom}</span>
                        <button
                            on:click={handleLogout}
                            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Déconnexion
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {#if $user}
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h2 class="text-lg leading-6 font-medium text-gray-900">
                        Informations du profil
                    </h2>
                </div>
                <div class="border-t border-gray-200">
                    <dl>
                        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt class="text-sm font-medium text-gray-500">Nom complet</dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {$user.nom}
                            </dd>
                        </div>
                        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt class="text-sm font-medium text-gray-500">Email</dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {$user.email}
                            </dd>
                        </div>
                        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt class="text-sm font-medium text-gray-500">Statut de l'email</dt>
                            <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                                {#if $user.email_verifie}
                                    <span class="text-green-600">Vérifié</span>
                                {:else}
                                    <span class="text-red-600">Non vérifié</span>
                                {/if}
                            </dd>
                        </div>
                        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt class="text-sm font-medium text-gray-500">Rôle</dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {$user.role || 'USER'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        {:else}
            <div class="text-center">
                <p class="text-gray-500">Chargement...</p>
            </div>
        {/if}
    </main>
</div>

