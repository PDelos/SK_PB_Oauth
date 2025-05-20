<script lang="ts">
    let { data } = $props();
    const error = data.error;
    console.log('Error:', error);
</script>

<main>
    <h1>Error {error.status}</h1>
    <p>{error.message}</p>
    <a href="/">Go back to the homepage</a>
</main>
