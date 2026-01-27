<script lang="ts">
	import { tablesDB, DATABASE_ID, PROFESSORS_TABLE_ID } from '$lib/appwrite';
	import { Query } from 'appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Search, AlertCircle } from 'lucide-svelte';

	let professors: any[] = $state([]);
	let query: string = $state('');
	let loading: boolean = $state(true);
	let error: string = $state('');

	let filteredProfessors = $derived(
		professors.filter((prof) => {
			const searchTerm = query.toLowerCase();
			const profName = prof.name.toLowerCase();
			const profCourse = prof.course_name.toLowerCase();

			// Check course name (exact match)
			if (profCourse.includes(searchTerm)) {
				return true;
			}

			// For name search, split query into words and check if all words are present
			const queryWords = searchTerm.split(' ').filter((word) => word.length > 0);
			return queryWords.every((word) => profName.includes(word));
		})
	);

	onMount(async () => {
		try {
			const response = await tablesDB.listRows({
				databaseId: DATABASE_ID,
				tableId: PROFESSORS_TABLE_ID,
				queries: [Query.limit(1000)]
			});
			professors = response.rows;

			// Check for query parameter in URL
			const urlParams = new URLSearchParams($page.url.search);
			const searchQuery = urlParams.get('q');
			if (searchQuery) {
				query = searchQuery;
			}
		} catch (err) {
			console.error('Error fetching professors:', err);
			error = 'Erro ao carregar professores.';
		} finally {
			loading = false;
		}
	});

	/**
	 * Selects a professor and navigates to their page.
	 */
	function selectProfessor(slug: string): void {
		goto(`/professor/${slug}`);
	}
</script>

<div class="min-h-screen font-sans">
	<div class="container mx-auto px-4 py-12">
		<div class="mx-auto max-w-2xl">
			<div class="glass-card w-full p-8 backdrop-blur-xl">
				<div class="mb-8">
					<h2 class="text-3xl font-black text-base-content">Buscar Professores</h2>
					<p class="mt-2 text-base-content/60">
						Encontre o professor ou disciplina que você procura.
					</p>
				</div>

				<div class="form-control">
					<div class="relative">
						<input
							type="search"
							class="glass-input input input-lg w-full pl-12 text-lg transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
							placeholder="Nome do professor ou disciplina..."
							bind:value={query}
						/>
						<Search
							class="pointer-events-none absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-base-content/50"
						/>
					</div>
				</div>

				<div class="mt-6">
					{#if loading}
						<div class="flex justify-center py-12">
							<span class="loading loading-lg loading-dots text-primary"></span>
						</div>
					{:else if error}
						<div class="rounded-xl border border-error/20 bg-error/10 p-6 text-center">
							<div class="mb-3 text-4xl">⚠️</div>
							<h3 class="mb-2 text-lg font-bold text-error">Erro ao carregar dados</h3>
							<p class="text-sm opacity-80">{error}</p>
						</div>
					{:else if query && filteredProfessors.length > 0}
						<div
							class="mt-4 overflow-hidden rounded-2xl border border-white/20 bg-white/30 shadow-sm"
						>
							<ul class="divide-y divide-white/20">
								{#each filteredProfessors as prof}
									<li>
										<button
											onclick={() => selectProfessor(prof.slug)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													selectProfessor(prof.slug);
												}
											}}
											class="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/40 focus:bg-white/40 focus:outline-none"
										>
											{#if prof.profile_picture_url}
												<img
													src={prof.profile_picture_url}
													alt={prof.name}
													class="h-12 w-12 rounded-full object-cover shadow-sm"
												/>
											{:else}
												<div class="avatar avatar-placeholder">
													<div class="h-12 w-12 rounded-full bg-primary/20 text-primary">
														<span class="text-lg font-bold"
															>{prof.name.charAt(0).toUpperCase()}</span
														>
													</div>
												</div>
											{/if}
											<div class="min-w-0 flex-1">
												<div class="font-bold text-base-content">{prof.name}</div>
												<div class="truncate text-sm text-base-content/70">
													{prof.course_name} • {prof.university_slug}
												</div>
											</div>
											<div
												class="text-primary opacity-0 transition-opacity group-hover:opacity-100"
											>
												→
											</div>
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{:else if query && filteredProfessors.length === 0}
						<div class="py-12 text-center">
							<div class="mb-4 text-6xl opacity-20">🔍</div>
							<h3 class="mb-2 text-lg font-bold text-base-content/80">
								Nenhum resultado encontrado
							</h3>
							<p class="text-base-content/60">Tente buscar por outro nome ou disciplina.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
