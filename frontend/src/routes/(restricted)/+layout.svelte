<script lang="ts">
 import * as Sidebar from "$lib/components/ui/sidebar/index.js";
 import AppSidebar from "$lib/components/app-sidebar.svelte";
 import AppBreadCrumb from "$lib/components/app-breadcrumb.svelte";
 
 let { children } = $props();
</script>
 
<Sidebar.Provider>
    <AppSidebar />
    <main >
        <Sidebar.Trigger />
        <AppBreadCrumb />
        {@render children?.()}
    </main>
</Sidebar.Provider>