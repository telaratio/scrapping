<!-- Interface de test pour le scraping de pages web -->
<script>
    let url = '';
    let loading = false;
    let error = null;
    let result = null;

    async function handleSubmit() {
        loading = true;
        error = null;
        result = null;

        try {
            const response = await fetch('/api/scraping/webpage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du scraping');
            }

            result = data;
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-5xl">
    <h1 class="text-2xl font-bold mb-6">Extraction de Contenu Web</h1>

    <form on:submit|preventDefault={handleSubmit} class="mb-8">
        <div class="mb-4">
            <label for="url" class="block text-sm font-medium mb-2">URL de la page</label>
            <input
                type="url"
                id="url"
                bind:value={url}
                placeholder="https://exemple.com"
                class="w-full p-2 border rounded"
                required
            />
        </div>

        <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
        >
            {loading ? 'Extraction en cours...' : 'Extraire le contenu'}
        </button>
    </form>

    {#if error}
        <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p class="text-red-700">{error}</p>
        </div>
    {/if}

    {#if result}
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="p-4 bg-gray-50 border-b">
                <h2 class="text-lg font-semibold">Résultats de l'extraction</h2>
                <div class="text-sm text-gray-600">
                    <p>URL: {result.url}</p>
                    <p>Titre: {result.title}</p>
                    <p>Extrait le: {new Date(result.timestamp).toLocaleString()}</p>
                </div>
            </div>

            <div class="p-4">
                <div class="relative">
                    <!-- Bouton de copie -->
                    <button
                        class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                        on:click={() => {
                            navigator.clipboard.writeText(result.content);
                        }}
                    >
                        Copier
                    </button>
                    <!-- Affichage du contenu structuré -->
                    <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-sm whitespace-pre-wrap font-mono">{result.content}</pre>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Ajoutez des styles personnalisés si nécessaire */
</style> 