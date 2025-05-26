<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import AppBreadCrumb from '$lib/components/app-breadcrumb.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main>
		<div class="flex grid-cols-2 gap-4 items-center">
			<Sidebar.Trigger />
			<AppBreadCrumb />
		</div>
		{@render children?.()}
	</main>
</Sidebar.Provider>
