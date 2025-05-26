<script lang="ts">
	import { onMount } from 'svelte';
	import { loginWithOAuth, getOAuthProviders } from '$lib/auth';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	let loading: boolean = $state(true);
	let providers: string[] = $state([]);
	let currentProvider: string | null = $state(null);

	// Before component mounts, we get all providers in pocketbase
	onMount(async () => {
		providers = await getOAuthProviders().catch(() => []);
		loading = false;
	});

	function handleLogin(providerId: string) {
		currentProvider = providerId; // Show loading while authenticating
		loginWithOAuth(providerId).finally(() => {
			loading = false;
		});
	}

	// Format providers for display
	const formattedProviders = $derived(
		providers.map((provider) => ({
			id: provider,
			name: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize first letter
			iconUrl: `/icons/auth/${provider.toLowerCase()}.svg`
		}))
	);
</script>

<section class="flex items-center justify-center w-screen h-screen">
	<Card.Root class="w-100">
		<Card.Header>
			<Card.Title class="text-center text-4xl font-bold">Login</Card.Title>
			<Card.Description class="text-center text-md">
				{#if loading}
					Loading providers...
				{:else if providers.length === 0}
					No login providers available
				{:else}
					Choose a provider to continue
				{/if}
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<div class="flex flex-col gap-4 justify-start">
				{#if providers.length > 0}
					{#each formattedProviders as provider}
						<Button
							onclick={() => handleLogin(provider.id)}
							variant="outline"
							disabled={currentProvider === provider.id}
						>
							<div class="flex w-[60%] justify-start items-center gap-4">
								<span class="flex items-center justify-center w-6 h-6">
									<img
										src={provider.iconUrl}
										alt={`${provider.name} icon`}
										class="w-full h-full object-contain"
									/>
								</span>
								<p class="font-medium">Continue with {provider.name}</p>
							</div>
						</Button>
					{/each}
				{/if}
			</div>
		</Card.Content>

		{#if providers.length > 0}
			<div class="px-6 my-2">
				<Separator class="bg-accent" />
			</div>

			<Card.Footer>
				<p class="text-sm text-center text-muted-foreground">
					By signing in, you agree to our
					<a href="/terms" class="text-primary hover:underline"> Terms of Service </a>
					and
					<a href="/privacy" class="text-primary hover:underline"> Privacy Policy </a>
				</p>
			</Card.Footer>
		{/if}
	</Card.Root>
</section>
