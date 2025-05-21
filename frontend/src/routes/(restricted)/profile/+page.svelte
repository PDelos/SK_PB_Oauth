<script lang="ts">
    import { pb } from '$lib/pocketbase';
    import { logout, deleteAccount } from '$lib/auth';
    
    let { data } = $props();
    const user = data.user;
    
    let isDeleting = $state(false);
    let showConfirmDialog = $state(false);
    let isLoggingOut = $state(false);
    
    function handleLogout() {
        isLoggingOut = true;
        // Using finally without catch - error handling in auth.ts
        logout().finally(() => {
            isLoggingOut = false;
        });
    }
    
    function confirmDeleteAccount() {
        showConfirmDialog = true;
    }
    
    function cancelDelete() {
        showConfirmDialog = false;
    }
    
    function handleDeleteAccount() {
        isDeleting = true;
        // Using finally without catch - error handling in auth.ts
        deleteAccount().finally(() => {
            isDeleting = false;
            showConfirmDialog = false;
        });
    }
</script>

<div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Your Profile</h1>
    
    {#if user}
        <div class="mb-8">
            <div class="flex items-center justify-center mb-4">
                {#if user.avatar}
                    <img 
                        src={`${pb.baseUrl}/api/files/${user.collectionId}/${user.id}/${user.avatar}`} 
                        alt="Profile avatar" 
                        class="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                {:else}
                    <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500">
                        {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : '?'}
                    </div>
                {/if}
            </div>
            
            <div class="space-y-3">
                {#if user.name}
                    <div class="text-center">
                        <span class="font-semibold">Name:</span> {user.name}
                    </div>
                {/if}
                
                <div class="text-center">
                    <span class="font-semibold">Email:</span> {user.email}
                </div>
                
                {#if user.created}
                    <div class="text-center text-sm text-gray-500">
                        Member since: {new Date(user.created).toLocaleDateString()}
                    </div>
                {/if}
            </div>
        </div>
        
        <div class="flex flex-col space-y-4 mt-6">
            <button 
                class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
                onclick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            
            <button 
                class="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors duration-200"
                onclick={confirmDeleteAccount}
                disabled={showConfirmDialog || isDeleting}
            >
                Delete Account
            </button>
        </div>
    {:else}
        <p class="text-center text-gray-600">Loading profile information...</p>
    {/if}
</div>

{#if showConfirmDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 class="text-xl font-bold mb-4 text-red-600">Delete Account?</h2>
            <p class="mb-6 text-gray-700">
                This action cannot be undone. All your data will be permanently deleted.
                Are you sure you want to continue?
            </p>
            
            <div class="flex space-x-3">
                <button 
                    class="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
                    onclick={cancelDelete}
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button 
                    class="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                    onclick={handleDeleteAccount}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
            </div>
        </div>
    </div>
{/if}