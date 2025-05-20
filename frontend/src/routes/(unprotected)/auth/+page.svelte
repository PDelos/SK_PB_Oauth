<script lang="ts">
    import { onMount } from 'svelte';
    import { getOAuthProviders, loginWithOAuth } from '$lib/auth';

    let providers: string[] = []; // Array to store the fetched provider names

    // Fetch the list of providers on component mount
    onMount(async () => {
        try {
            providers = await getOAuthProviders(); // Use the reusable function
        } catch (err) {
            console.error('Failed to fetch providers:', err);
        }
    });

    // Function to log in with a specific provider
    async function login(provider: string): Promise<void> {
        try {
            await loginWithOAuth(provider); // Use the reusable function
        } catch (err) {
            console.error('Login failed:', err);
        }
    }
</script>

<!-- Dynamically render buttons for each provider -->
<ul>
    {#if providers.length > 0}
        {#each providers as provider}
            <li>
                <button onclick={() => login(provider)}>
                    Login with {provider}
                </button>
            </li>
        {/each}
    {:else}
        <li>No providers available</li>
    {/if}
</ul>