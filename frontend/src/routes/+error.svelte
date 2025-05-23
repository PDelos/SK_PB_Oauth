<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>Something went wrong</h1>
<p>We are sorry, but an error occurred while processing your request.</p>
<h1>{page.error?.message}</h1>