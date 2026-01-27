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

<div class="min-h-screen bg-base-200 font-sans">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-3xl font-black">Buscar Professores</h2>

					<div class="form-control">
						<div class="label">
							<span class="label-text font-bold">Digite o nome do professor ou disciplina</span>
						</div>
						<div class="relative mt-2">
							<input
								type="search"
								class="input-bordered input input-lg w-full rounded-full bg-base-200 pr-12 focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
								placeholder="Buscar professores..."
								bind:value={query}
							/>
							<Search
								class="absolute top-1/2 right-4 h-6 w-6 -translate-y-1/2 transform text-gray-400"
							/>
						</div>
					</div>

					{#if loading}
						<div class="flex justify-center py-8">
							<span class="loading loading-xl loading-dots"></span>
						</div>
					{:else if error}
						<div class="mt-4 rounded-box border border-error/20 bg-error/10 p-6 text-center">
							<div class="mb-3 text-4xl">⚠️</div>
							<h3 class="mb-2 text-lg font-semibold text-error">Erro ao carregar dados</h3>
							<p class="text-base opacity-80">{error}</p>
						</div>
					{:else if query && filteredProfessors.length > 0}
						<div class="dropdown-open dropdown mt-2 w-full">
							<div class="dropdown-content z-10 max-h-80 w-full overflow-y-auto">
								<ul
									class="menu-compact menu w-full rounded-box border border-base-300 bg-base-100 shadow-xl"
								>
									{#each filteredProfessors as prof}
										<li class="w-full">
											<button
												onclick={() => selectProfessor(prof.slug)}
												onkeydown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault();
														selectProfessor(prof.slug);
													}
												}}
												class="w-full text-left hover:bg-primary/10 focus:bg-primary/10"
											>
												<div class="flex items-center gap-3 px-3 py-2">
													{#if prof.profile_picture_url}
														<img
															src={prof.profile_picture_url}
															alt={prof.name}
															class="h-10 w-10 rounded-full object-cover"
														/>
													{:else}
														<div class="avatar avatar-placeholder">
															<div class="h-10 w-10 rounded-full bg-primary text-primary-content">
																<span class="text-lg font-bold"
																	>{prof.name.charAt(0).toUpperCase()}</span
																>
															</div>
														</div>
													{/if}
													<div class="min-w-0 flex-1">
														<div class="truncate font-semibold">{prof.name}</div>
														<div class="truncate text-sm opacity-70">
															{prof.course_name} • {prof.university_slug}
														</div>
													</div>
												</div>
											</button>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{:else if query && filteredProfessors.length === 0}
						<div
							class="mt-4 rounded-box border-2 border-dashed border-base-300 bg-base-200/50 p-8 text-center"
						>
							<div class="mb-4 text-6xl opacity-50">🔍</div>
							<h3 class="mb-2 text-lg font-semibold">Nenhum professor encontrado</h3>
							<p class="text-base opacity-70">
								Não encontramos nenhum professor com "{query}".<br />
								Tente usar termos diferentes ou verifique a ortografia.
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
