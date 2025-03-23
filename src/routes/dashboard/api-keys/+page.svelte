<!-- Page de gestion des clés API -->
<script>
    import { onMount } from 'svelte';

    let loading = false;
    let error = null;
    let keys = [];
    let showCreateModal = false;
    let newKeyName = '';

    // Chargement des clés API
    async function loadKeys() {
        loading = true;
        error = null;
        try {
            const response = await fetch('/api/keys');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors du chargement des clés');
            }
            keys = await response.json();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    // Création d'une nouvelle clé
    async function createKey() {
        if (!newKeyName.trim()) return;
        
        loading = true;
        error = null;
        try {
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: newKeyName })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création de la clé');
            }

            keys = [...keys, data];
            showCreateModal = false;
            newKeyName = '';
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    // Activation/désactivation d'une clé
    async function toggleKey(id, currentState) {
        loading = true;
        error = null;
        try {
            const response = await fetch(`/api/keys/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actif: !currentState })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la modification de la clé');
            }

            keys = keys.map(key => key.id === id ? { ...key, actif: !currentState } : key);
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    // Suppression d'une clé
    async function deleteKey(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé ?')) return;

        loading = true;
        error = null;
        try {
            const response = await fetch(`/api/keys/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la suppression de la clé');
            }

            keys = keys.filter(key => key.id !== id);
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    // Copie de la clé dans le presse-papier
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Clé copiée dans le presse-papier !');
        } catch (err) {
            console.error('Erreur lors de la copie :', err);
        }
    }

    onMount(loadKeys);
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Gestion des Clés API</h1>
        <button
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            on:click={() => showCreateModal = true}
            disabled={loading || keys.length >= 5}
        >
            Nouvelle Clé
        </button>
    </div>

    {#if error}
        <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p class="text-red-700">{error}</p>
        </div>
    {/if}

    {#if loading}
        <div class="text-center py-4">
            <span class="text-gray-600">Chargement...</span>
        </div>
    {:else if keys.length === 0}
        <div class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-gray-600">Aucune clé API trouvée</p>
            <p class="text-sm text-gray-500 mt-2">Créez votre première clé pour commencer</p>
        </div>
    {:else}
        <div class="grid gap-4">
            {#each keys as key}
                <div class="bg-white shadow rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg">{key.nom}</h3>
                            <div class="mt-1 flex items-center space-x-2">
                                <code class="bg-gray-100 px-2 py-1 rounded text-sm">{key.cle}</code>
                                <button
                                    class="text-blue-500 hover:text-blue-700 text-sm"
                                    on:click={() => copyToClipboard(key.cle)}
                                >
                                    Copier
                                </button>
                            </div>
                            <div class="mt-2 text-sm text-gray-600">
                                <p>Créée le: {new Date(key.date_creation).toLocaleString()}</p>
                                <p>Dernière utilisation: {key.derniere_utilisation ? new Date(key.derniere_utilisation).toLocaleString() : 'Jamais'}</p>
                                <p>Utilisations (30 jours): {key.utilisation_30_jours}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button
                                class={`px-3 py-1 rounded text-sm ${key.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                on:click={() => toggleKey(key.id, key.actif)}
                            >
                                {key.actif ? 'Active' : 'Inactive'}
                            </button>
                            <button
                                class="text-red-500 hover:text-red-700"
                                on:click={() => deleteKey(key.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if showCreateModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-bold mb-4">Nouvelle Clé API</h2>
                <form on:submit|preventDefault={createKey}>
                    <div class="mb-4">
                        <label for="keyName" class="block text-sm font-medium mb-2">Nom de la clé</label>
                        <input
                            type="text"
                            id="keyName"
                            bind:value={newKeyName}
                            placeholder="Ex: Production, Test, etc."
                            class="w-full p-2 border rounded"
                            required
                            minlength="3"
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            class="px-4 py-2 text-gray-600 hover:text-gray-800"
                            on:click={() => {
                                showCreateModal = false;
                                newKeyName = '';
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={loading || !newKeyName.trim() || newKeyName.length < 3}
                        >
                            Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Styles spécifiques si nécessaire */
</style> 