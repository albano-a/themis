<script lang="ts">
	import { tablesDB, DATABASE_ID, PROFESSORS_TABLE_ID } from '$lib/appwrite';
	import { Query } from 'appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Search, AlertCircle, ArrowRight } from 'lucide-svelte';

	let professors: any[] = $state([]);
	let query: string = $state('');
	let loading: boolean = $state(true);
	let error: string = $state('');

	let selectedCourse = $state('');
	let selectedUniversity = $state('');

	// Pagination State
	let currentPage = $state(1);
	const itemsPerPage = 10;

	let uniqueCourses = $derived([...new Set(professors.map((p) => p.course_name))].sort());
	let uniqueUniversities = $derived([...new Set(professors.map((p) => p.university_slug))].sort());

	let filteredProfessors = $derived(
		professors.filter((prof) => {
			const searchTerm = query.toLowerCase();
			const profName = prof.name.toLowerCase();
			const profCourse = prof.course_name.toLowerCase();

			// Apply Dropdown Filters
			if (selectedCourse && prof.course_name !== selectedCourse) return false;
			if (selectedUniversity && prof.university_slug !== selectedUniversity) return false;

			if (!searchTerm) return true;

			// Check course name (exact match)
			if (profCourse.includes(searchTerm)) {
				return true;
			}

			// For name search, split query into words and check if all words are present
			const queryWords = searchTerm.split(' ').filter((word) => word.length > 0);
			return queryWords.every((word) => profName.includes(word));
		})
	);

	// Pagination Logic
	let totalPages = $derived(Math.ceil(filteredProfessors.length / itemsPerPage));
	let paginatedProfessors = $derived(
		filteredProfessors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Reset pagination on filter change (using a reactive statement instead of effect for simplicity in Svelte 5 logic flow if needed, but derived covers calculation. We need to reset page when filters change)
	$effect(() => {
		// Watch filter changes to reset page
		query;
		selectedCourse;
		selectedUniversity;
		currentPage = 1;
	});

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

				<!-- Filters -->
				<div class="mt-4 flex flex-wrap gap-4">
					<select class="glass-input select flex-1" bind:value={selectedUniversity}>
						<option value="">Todas as Universidades</option>
						{#each uniqueUniversities as uni}
							<option value={uni}>{uni}</option>
						{/each}
					</select>

					<select class="glass-input select flex-1" bind:value={selectedCourse}>
						<option value="">Todas as Disciplinas</option>
						{#each uniqueCourses as course}
							<option value={course}>{course}</option>
						{/each}
					</select>
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
					{:else if filteredProfessors.length > 0}
						<div
							class="mt-4 overflow-hidden rounded-2xl border border-white/20 bg-white/30 shadow-sm"
						>
							<ul class="divide-y divide-white/20">
								{#each paginatedProfessors as prof}
									<li>
										<button
											onclick={() => selectProfessor(prof.slug)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													selectProfessor(prof.slug);
												}
											}}
											class="group flex w-full items-center gap-4 p-4 text-left transition-all duration-300 hover:bg-primary/10 hover:pl-6 focus:bg-white/40 focus:outline-none"
										>
											{#if prof.profile_picture_url}
												<img
													src={prof.profile_picture_url}
													alt={prof.name}
													class="h-12 w-12 rounded-full object-cover shadow-sm transition-transform group-hover:scale-110"
												/>
											{:else}
												<div class="avatar avatar-placeholder">
													<div
														class="h-12 w-12 rounded-full bg-primary/20 text-primary transition-transform group-hover:scale-110"
													>
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
												class="translate-x-2.5 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
											>
												<ArrowRight class="h-6 w-6" />
											</div>
										</button>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Pagination Controls -->
						{#if totalPages > 1}
							<div class="mt-8 flex justify-center">
								<div class="join shadow-lg">
									<button
										class="glass-btn btn join-item border-white/20"
										disabled={currentPage === 1}
										onclick={() => currentPage--}
									>
										«
									</button>
									<button class="glass-btn no-animation btn join-item border-white/20">
										Página {currentPage} de {totalPages}
									</button>
									<button
										class="glass-btn btn join-item border-white/20"
										disabled={currentPage === totalPages}
										onclick={() => currentPage++}
									>
										»
									</button>
								</div>
							</div>
						{/if}
					{:else if filteredProfessors.length === 0}
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
