<script>
    import { onMount } from 'svelte';
    import { user, checkAuth, getToken } from '$lib/auth';
    import { goto } from '$app/navigation';

    let apiKeys = [];
    let newKeyName = '';
    let loading = true;
    let error = null;
    let successMessage = '';

    // Charger les clés API
    async function loadApiKeys() {
        try {
            const token = await getToken();
            if (!token) {
                error = 'Non authentifié';
                return;
            }

            const response = await fetch('/api/keys', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    error = 'Session expirée, veuillez vous reconnecter';
                    goto('/login');
                    return;
                }
                throw new Error('Erreur lors du chargement des clés API');
            }
            
            apiKeys = await response.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    // Créer une nouvelle clé API
    async function createApiKey() {
        if (!newKeyName.trim()) {
            error = 'Le nom de la clé est requis';
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                error = 'Non authentifié';
                return;
            }

            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nom: newKeyName })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    error = 'Session expirée, veuillez vous reconnecter';
                    goto('/login');
                    return;
                }
                throw new Error('Erreur lors de la création de la clé API');
            }
            
            const newKey = await response.json();
            apiKeys = [...apiKeys, newKey];
            newKeyName = '';
            successMessage = 'Clé API créée avec succès';
        } catch (err) {
            error = err.message;
        }
    }

    // Activer/désactiver une clé API
    async function toggleApiKey(id, currentStatus) {
        try {
            const token = await getToken();
            if (!token) {
                error = 'Non authentifié';
                return;
            }

            const response = await fetch(`/api/keys/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ actif: !currentStatus })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    error = 'Session expirée, veuillez vous reconnecter';
                    goto('/login');
                    return;
                }
                throw new Error('Erreur lors de la mise à jour de la clé API');
            }
            
            const updatedKey = await response.json();
            apiKeys = apiKeys.map(key => key.id === id ? updatedKey : key);
            successMessage = `Clé API ${updatedKey.actif ? 'activée' : 'désactivée'} avec succès`;
        } catch (err) {
            error = err.message;
        }
    }

    // Supprimer une clé API
    async function deleteApiKey(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) return;

        try {
            const token = await getToken();
            if (!token) {
                error = 'Non authentifié';
                return;
            }

            const response = await fetch(`/api/keys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    error = 'Session expirée, veuillez vous reconnecter';
                    goto('/login');
                    return;
                }
                throw new Error('Erreur lors de la suppression de la clé API');
            }
            
            apiKeys = apiKeys.filter(key => key.id !== id);
            successMessage = 'Clé API supprimée avec succès';
        } catch (err) {
            error = err.message;
        }
    }

    // Copier la clé API dans le presse-papier
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        successMessage = 'Clé API copiée dans le presse-papier';
    }

    onMount(() => {
        // Vérifier si l'utilisateur est connecté
        if (!checkAuth()) {
            goto('/login');
            return;
        }
        // Charger les clés API
        loadApiKeys();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Gestion des clés API</h1>

    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}

    {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
        </div>
    {/if}

    <!-- Formulaire de création de clé API -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-xl font-semibold mb-4">Créer une nouvelle clé API</h2>
        <div class="flex gap-4">
            <input
                type="text"
                bind:value={newKeyName}
                placeholder="Nom de la clé API"
                class="flex-1 p-2 border rounded"
            />
            <button
                on:click={createApiKey}
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Créer
            </button>
        </div>
    </div>

    <!-- Liste des clés API -->
    {#if loading}
        <div class="text-center">Chargement...</div>
    {:else if apiKeys.length === 0}
        <div class="text-center text-gray-500">Aucune clé API trouvée</div>
    {:else}
        <div class="grid gap-4">
            {#each apiKeys as key}
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="font-semibold">{key.nom}</h3>
                            <p class="text-sm text-gray-600 mt-1">{key.cle}</p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                on:click={() => copyToClipboard(key.cle)}
                                class="text-blue-500 hover:text-blue-700"
                            >
                                Copier
                            </button>
                            <button
                                on:click={() => toggleApiKey(key.id, key.actif)}
                                class="text-{key.actif ? 'green' : 'red'}-500 hover:text-{key.actif ? 'green' : 'red'}-700"
                            >
                                {key.actif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                                on:click={() => deleteApiKey(key.id)}
                                class="text-red-500 hover:text-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500">
                        Créée le {new Date(key.date_creation).toLocaleDateString()}
                        {#if key.date_modification !== key.date_creation}
                            • Modifiée le {new Date(key.date_modification).toLocaleDateString()}
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    /* Styles spécifiques si nécessaire */
</style> 