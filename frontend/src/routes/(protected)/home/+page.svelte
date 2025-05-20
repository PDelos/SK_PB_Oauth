<script lang="ts">
    let { data } = $props();
    const user = data.user; // Extract the user object from the data prop
</script>

<main>
    <h1>Welcome, to the homepage! {user?.email}</h1>
</main>