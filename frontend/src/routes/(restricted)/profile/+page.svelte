<script lang="ts">    import { pb } from '$lib/pocketbase';
    import { logout, deleteAccount, updateUserInfo } from '$lib/auth';
    import * as Avatar from "$lib/components/ui/avatar/index.js";    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { onMount } from 'svelte';
    
    let { data } = $props();
    const user = data.user;
    const userInfo = data.userInfo;    
    
    // Form state
    let formData = $state({
        name: userInfo?.name || '',
        avatar: null as File | null,
        cv: null as File | null,
        github: userInfo?.github || '',
        linkedin: userInfo?.linkedin || '',
        website: userInfo?.website || '',
        preferences: Array.isArray(userInfo?.preferences) ? userInfo.preferences.join(', ') : userInfo?.preferences || ''
    });

    // UI state
    let isDeleting = $state(false);
    let isLoggingOut = $state(false);
    let isUpdating = $state(false);let avatarPreview = $state(userInfo?.avatar ? `${pb.baseURL}/api/files/${userInfo.collectionId}/${userInfo.id}/${userInfo.avatar}` : '');
    let cvPreview = $state(userInfo?.cv ? `${pb.baseURL}/api/files/${userInfo.collectionId}/${userInfo.id}/${userInfo.cv}` : '');
    
    // File input references
    let fileInput = $state() as HTMLInputElement;
    let cvInput = $state() as HTMLInputElement;

    let preferences: string[] = $state([]);

    onMount(async () => {
        try {
            const collections = await pb.collections.getList();
            const userInfoCollection = collections.items.find(col => col.name === 'user_info');

            if (!userInfoCollection) {
                throw new Error('user_info collection not found');
            }

            const preferencesField = userInfoCollection.schema.find(field => field.name === 'preferences');
            if (preferencesField) {
                preferences = preferencesField.options.values;
            }
            console.log('Preferences loaded:', preferences);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        }
    });


    function handleLogout() {
        isLoggingOut = true;
        logout().finally(() => {
            isLoggingOut = false;
        });
    }
    
    function handleAvatarClick() {
        fileInput?.click();
    }
    
    function handleCVClick() {
        cvInput?.click();
    }
    
    function handleAvatarChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            formData.avatar = file;
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function handleCVChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            // Validate file type (PDF or images)
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a PDF or image file (JPG, PNG)');
                return;
            }
            
            // Validate file size (10MB max for CV)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            
            formData.cv = file;
            cvPreview = file.name;
        }
    }    
    
    async function handleUpdate() {
        isUpdating = true;
        try {
            // Update user-info data
            const userInfoData: Record<string, any> = {
                name: formData.name,
                github: formData.github,
                linkedin: formData.linkedin,
                website: formData.website,
                preferences: formData.preferences.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
            };

            if (formData.avatar) {
                userInfoData.avatar = formData.avatar;
            }

            if (formData.cv) {
                userInfoData.cv = formData.cv;
            }

            await updateUserInfo(userInfoData);
            
            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            isUpdating = false;
        }    }
    
    function handleDeleteAccount() {
        isDeleting = true;
        deleteAccount().finally(() => {
            isDeleting = false;
        });
    }
</script>

<div class="max-w-6xl mx-auto p-6">
    <!-- Page Header -->
    <section class="text-center space-y-2 mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p class="text-muted-foreground">Manage your account information and preferences</p>
    </section>
    
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">        
        <!-- Left Column - Avatar and User Info -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Avatar Section -->
            <Card.Root>
                <Card.Content class="flex flex-col items-center space-y-4 p-6">
                    <div class="relative">
                        <Avatar.Root class="h-32 w-32 cursor-pointer hover:opacity-80 transition-opacity" onclick={handleAvatarClick}>
                            <Avatar.Image 
                                src={avatarPreview} 
                                alt="Profile picture" 
                            />
                            <Avatar.Fallback class="text-2xl">
                                {(formData.name || user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <!-- Overlay icon for upload indication -->
                        <button 
                            type="button"
                            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-0" 
                            onclick={handleAvatarClick}
                            aria-label="Upload profile picture"
                        >
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Hidden file input -->
                    <input
                        bind:this={fileInput}
                        type="file"
                        accept="image/*"
                        onchange={handleAvatarChange}
                        class="hidden"
                    />
                    
                    <p class="text-sm text-muted-foreground text-center">Click to change avatar</p>
                </Card.Content>
            </Card.Root>

            <!-- User Status Card -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Account Status</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center space-x-3">
                        <!-- Status Indicator -->
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {user.approved ? 'bg-green-100' : 'bg-yellow-100'}">
                            {#if user.approved}
                                <!-- Checkmark Icon -->
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            {:else}
                                <!-- Clock Icon -->
                                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            {/if}
                        </div>
                        
                        <div>
                            <p class="font-medium {user.approved ? 'text-green-700' : 'text-yellow-700'}">
                                {user.approved ? 'Account Approved' : 'Pending Approval'}
                            </p>
                            <p class="text-sm text-muted-foreground">
                                {user.approved ? 'Your account has full access' : 'Waiting for administrator approval'}
                            </p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>        <!-- Right Column - Form and Actions -->
        <div class="lg:col-span-2 space-y-6">            
            <!-- Account Information Card -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Account Information</Card.Title>
                </Card.Header>
                <Card.Content>
                    <!-- Form Fields -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Email Field (Disabled) -->
                        <div class="space-y-2">
                            <Label for="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={user.email} 
                                disabled 
                                class="bg-gray-50"
                            />
                            <p class="text-sm text-muted-foreground">Email cannot be changed</p>
                        </div>

                        <!-- Name Field (Editable) -->
                        <div class="space-y-2">
                            <Label for="name">Display Name</Label>
                            <Input 
                                id="name" 
                                type="text" 
                                bind:value={formData.name}
                                placeholder="Enter your name"
                            />
                        </div>

                        <!-- GitHub Field -->
                        <div class="space-y-2">
                            <Label for="github">GitHub Profile</Label>
                            <Input 
                                id="github" 
                                type="url" 
                                bind:value={formData.github}
                                placeholder="https://github.com/username"
                            />
                        </div>

                        <!-- LinkedIn Field -->
                        <div class="space-y-2">
                            <Label for="linkedin">LinkedIn Profile</Label>
                            <Input 
                                id="linkedin" 
                                type="url" 
                                bind:value={formData.linkedin}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>

                        <!-- Website Field -->
                        <div class="space-y-2">
                            <Label for="website">Website</Label>
                            <Input 
                                id="website" 
                                type="url" 
                                bind:value={formData.website}
                                placeholder="https://example.com"
                            />
                        </div>

                        <!-- CV Upload Field -->
                        <div class="space-y-2">
                            <Label for="cv">CV/Resume</Label>
                            <div class="flex items-center gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onclick={handleCVClick}
                                    class="flex-shrink-0"
                                >
                                    Upload CV
                                </Button>
                                {#if cvPreview}
                                    <span class="text-sm text-muted-foreground truncate">{cvPreview}</span>
                                {:else}
                                    <span class="text-sm text-muted-foreground">No CV uploaded</span>
                                {/if}
                            </div>
                            <p class="text-sm text-muted-foreground">PDF or image files (max 10MB)</p>
                            
                            <!-- Hidden CV input -->
                            <input
                                bind:this={cvInput}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onchange={handleCVChange}
                                class="hidden"
                            />
                        </div>

                        <!-- Preferences Field (Full Width) -->
                        <div class="space-y-2 md:col-span-2">
                            <Label for="preferences">Preferences</Label>
                            <textarea 
                                id="preferences" 
                                bind:value={formData.preferences}
                                placeholder="Enter your preferences (comma-separated)"
                                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            ></textarea>
                            <p class="text-sm text-muted-foreground">Enter preferences separated by commas</p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <!-- Actions Card -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Account Actions</Card.Title>
                </Card.Header>
                <Card.Content>
                    <!-- Action Buttons -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Update Button -->
                        <Button 
                            onclick={handleUpdate} 
                            disabled={isUpdating}
                            class="w-full"
                        >
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                        </Button>

                        <!-- Logout Button -->
                        <Button 
                            variant="outline" 
                            onclick={handleLogout} 
                            disabled={isLoggingOut}
                            class="w-full"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </Button>                    
                        
                        <!-- Delete Account Button -->
                        <AlertDialog.Root>
                            <AlertDialog.Trigger
                                class={buttonVariants({ variant: "destructive" })}
                                disabled={isDeleting}
                            >
                                Delete Account
                            </AlertDialog.Trigger>
                            <AlertDialog.Content>
                                <AlertDialog.Header>
                                    <AlertDialog.Title>Confirm Account Deletion</AlertDialog.Title>
                                    <AlertDialog.Description>
                                        Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data from our servers.
                                    </AlertDialog.Description>
                                </AlertDialog.Header>
                                <AlertDialog.Footer>
                                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                    <AlertDialog.Action 
                                        onclick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        class={buttonVariants({ variant: "destructive" })}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                                    </AlertDialog.Action>
                                </AlertDialog.Footer>
                            </AlertDialog.Content>
                        </AlertDialog.Root>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
    
</div>