<script>
    export let data;
    const { users } = data;
  </script>
  
  <main>
    <h1>Liste des utilisateurs</h1>
    
    {#if users.length > 0}
      <ul>
        {#each users as user}
          <li>
            <h3>{user.nom || 'Sans nom'}</h3>
            <p>Email: {user.email}</p>
            <!-- Ajoutez d'autres champs selon votre modèle User -->
          </li>
        {/each}
      </ul>
    {:else}
      <p>Aucun utilisateur trouvé.</p>
    {/if}
  </main>
  
  
  <style>
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    ul {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    li {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 1rem;
      background-color: #f9f9f9;
    }
  </style>