<script lang="ts">
	// Function that will get the user name and set to the placeholder
	import { Search } from 'lucide-svelte';
	import { account, storage, BUCKET_ID } from '$lib/appwrite';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Avatar from '$lib/components/Avatar.svelte';
	import { getUserById, getAvatarUrl } from '$lib/appwrite';
	import { userStore } from '$lib/stores/userStore';

	/** @type {import('appwrite').Models.User | null} */
	let searchQuery: string = $state('');
	let avatarUrl = $state<string | null>(null);

	onMount(async () => {
		try {
			const u = await account.get();
			userStore.set(u);
			// Get user preferences to check for avatar
			const prefs = await account.getPrefs();
			if (prefs.avatarId) {
				const fetchedAvatarUrl = await getAvatarUrl(u.$id);
				avatarUrl = fetchedAvatarUrl;
				console.log('Fetched avatar URL:', avatarUrl);
			}
		} catch {
			userStore.set(null);
		}
	});

	async function logout() {
		try {
			await account.deleteSession('current');
			userStore.set(null); // Clear user state
			await goto('/login');
		} catch (err) {
			console.error(err);
		}
	}

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			goto('/search');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
</script>

<div class="glass-nav navbar sticky top-0 z-50 px-6 text-base-content">
	<div class="flex-1">
		<a
			href="/"
			class="btn gap-2 text-2xl font-black tracking-tighter text-primary btn-ghost hover:bg-white/20"
		>
			Classefy
		</a>
	</div>
	<div class="flex items-center gap-4">
		<div class="hidden max-w-md flex-1 md:flex">
			<div class="relative w-full">
				<input
					type="text"
					class="glass-input input input-sm h-10 w-full rounded-full pr-12 text-base-content placeholder-base-content/60 focus:bg-white/60 focus:ring-2 focus:ring-primary/20"
					placeholder="Buscar professores..."
					bind:value={searchQuery}
					onkeydown={handleKeydown}
				/>
				<Search
					class="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 transform cursor-pointer text-base-content/50 hover:text-primary"
					onclick={handleSearch}
				/>
			</div>
		</div>
		{#if $userStore}
			<!-- User is logged in: Show avatar dropdown -->
			<div class="dropdown dropdown-end">
				<div
					tabIndex={0}
					role="button"
					class="btn avatar avatar-placeholder btn-circle border border-white/30 btn-ghost hover:bg-primary/10"
				>
					<Avatar name={$userStore?.name} src={avatarUrl} size="h-10 w-10" />
				</div>
				<ul
					tabIndex="-1"
					class="glass-card dropdown-content menu z-1 mt-3 w-52 rounded-2xl p-2 shadow-2xl"
				>
					<li>
						<a href="/profile" class="justify-between rounded-lg py-2 font-medium"> Profile </a>
					</li>
					<li><a href="/settings" class="rounded-lg py-2 font-medium">Settings</a></li>
					<li>
						<button onclick={logout} class="rounded-lg py-2 font-medium text-error">Logout</button>
					</li>
				</ul>
			</div>
		{:else}
			<!-- No user logged in: Show login button -->
			<a href="/login" class="btn rounded-full btn-primary">Login</a>
		{/if}
	</div>
</div>
