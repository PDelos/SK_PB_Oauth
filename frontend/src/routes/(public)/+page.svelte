<script lang="ts">
    import { goto } from '$app/navigation';
    
    function navigateToAuth() {
        goto('/auth');
    }
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
    <div class="max-w-3xl w-full text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Welcome to Our Application</h1>
        
        <p class="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Experience seamless authentication with multiple providers and access your personalized dashboard.
        </p>
        
        <div class="space-y-4">
            <button 
                class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 text-lg"
                onclick={navigateToAuth}
            >
                Sign In
            </button>
            
            <div class="text-gray-600">
                <p>Secured with OAuth 2.0 - Simple, Fast, and Secure</p>
            </div>
        </div>
    </div>
</div>