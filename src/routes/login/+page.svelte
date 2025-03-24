<script>
    import { goto } from '$app/navigation';
    import { user } from '$lib/auth';
    
    let email = '';
    let password = '';
    let error = '';
    let loading = false;

    async function handleSubmit() {
        loading = true;
        error = '';
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            // Stockage des informations utilisateur
            user.set(data.user);
            
            // Redirection vers le dashboard
            goto('/dashboard');
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<main class="container">
    <div class="auth-container">
        <div class="auth-card">
            <h1 class="auth-title">Connexion</h1>
            
            {#if error}
                <div class="alert alert-error">{error}</div>
            {/if}

            <form on:submit|preventDefault={handleSubmit} class="auth-form">
                <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        class="form-input"
                        placeholder="votre@email.com"
                    />
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        bind:value={password}
                        required
                        class="form-input"
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" class="btn-primary w-full" disabled={loading}>
                    {#if loading}
                        <span class="loading-spinner"></span>
                        Connexion en cours...
                    {:else}
                        Se connecter
                    {/if}
                </button>
            </form>

            <div class="auth-links">
                <a href="/forgot-password" class="auth-link">Mot de passe oublié ?</a>
                <a href="/register" class="auth-link">Créer un compte</a>
            </div>
        </div>
    </div>
</main>

<style>
    .auth-container {
        min-height: calc(100vh - 4rem);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .auth-card {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
    }

    .auth-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 2rem;
        text-align: center;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-weight: 500;
        color: var(--text-color);
    }

    .form-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 0.375rem;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .form-input:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .auth-links {
        margin-top: 1.5rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
    }

    .auth-link {
        color: var(--primary-color);
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .auth-link:hover {
        color: var(--secondary-color);
    }

    .alert {
        padding: 1rem;
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
    }

    .alert-error {
        background-color: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .loading-spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
        margin-right: 0.5rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 640px) {
        .auth-card {
            padding: 1.5rem;
        }

        .auth-links {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
        }
    }
</style> 