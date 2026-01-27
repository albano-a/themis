<script lang="ts">
	// Function that will get the user name and set to the placeholder
	import { Search } from 'lucide-svelte';
	import { account, storage, BUCKET_ID } from '$lib/appwrite';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	/** @type {import('appwrite').Models.User | null} */
	let user: import('appwrite').Models.User | null = $state(null);
	let searchQuery: string = $state('');
	let avatarUrl: string = $state('');

	onMount(async () => {
		try {
			user = await account.get();
			// Get user preferences to check for avatar
			const prefs = await account.getPrefs();
			if (prefs.avatarId) {
				avatarUrl = storage.getFileView(BUCKET_ID, prefs.avatarId);
			}
		} catch {
			user = null;
		}
	});

	async function logout() {
		try {
			await account.deleteSession('current');
			user = null; // Clear user state
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

	/**
	 *
	 * @param {String} name
	 */
	function getInitials(name: string) {
		if (!name) return 'AA';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div
	class="navbar z-50 mx-auto mt-6 max-w-6xl rounded-full border border-base-200 bg-base-100/80 px-6 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl hover:shadow-primary/5"
>
	<div class="flex-1">
		<a href="/" class="btn gap-2 text-2xl font-black tracking-tighter text-primary btn-ghost">
			Classefy
		</a>
	</div>
	<div class="flex items-center gap-4">
		<div class="hidden max-w-md flex-1 md:flex">
			<div class="relative w-full">
				<input
					type="text"
					class="input-bordered input input-sm h-10 w-full rounded-full bg-base-200 pr-12 focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
					placeholder="Buscar professores..."
					bind:value={searchQuery}
					onkeydown={handleKeydown}
				/>
				<Search
					class="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 transform cursor-pointer text-gray-400 hover:text-primary"
					onclick={handleSearch}
				/>
			</div>
		</div>
		{#if user}
			<!-- User is logged in: Show avatar dropdown -->
			<div class="dropdown dropdown-end">
				<div
					tabIndex={0}
					role="button"
					class="placeholder btn avatar btn-circle border border-base-200 btn-ghost hover:bg-primary/10"
				>
					{#if avatarUrl}
						<div class="w-10 rounded-full">
							<img src={avatarUrl} alt="Avatar" class="h-full w-full rounded-full object-cover" />
						</div>
					{:else}
						<div class="w-10 rounded-full bg-primary/10 text-primary">
							<span class="text-xl font-bold">{getInitials(user.name)}</span>
						</div>
					{/if}
				</div>
				<ul
					tabIndex="-1"
					class="dropdown-content menu z-1 mt-3 w-52 menu-sm rounded-2xl bg-base-100 p-2 shadow-2xl ring-1 ring-base-200"
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
