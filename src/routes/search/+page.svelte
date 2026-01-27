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
		professors.filter(
			(prof) =>
				prof.name.toLowerCase().includes(query.toLowerCase()) ||
				prof.course_name.toLowerCase().includes(query.toLowerCase())
		)
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
						<div class="relative">
							<input
								type="text"
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
							<span class="loading loading-lg loading-spinner"></span>
						</div>
					{:else if error}
						<div class="mt-4 alert alert-error">
							<AlertCircle class="h-5 w-5" />
							<span>{error}</span>
						</div>
					{:else if query && filteredProfessors.length > 0}
						<div class="relative mt-2">
							<div
								class="absolute z-10 max-h-80 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-xl"
							>
								<ul class="menu-compact menu p-2">
									{#each filteredProfessors as prof}
										<li>
											<a
												href="/"
												onclick={(e) => {
													e.preventDefault();
													selectProfessor(prof.slug);
												}}
												onkeydown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault();
														selectProfessor(prof.slug);
													}
												}}
												class="cursor-pointer rounded-lg hover:bg-primary/10"
											>
												<div class="flex items-center gap-3 py-2">
													{#if prof.profile_picture_url}
														<img
															src={prof.profile_picture_url}
															alt={prof.name}
															class="h-10 w-10 rounded-full object-cover"
														/>
													{:else}
														<div
															class="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-content"
														>
															{prof.name.charAt(0).toUpperCase()}
														</div>
													{/if}
													<div>
														<div class="font-bold">{prof.name}</div>
														<div class="text-sm opacity-70">
															{prof.course_name} - {prof.university_slug}
														</div>
													</div>
												</div>
											</a>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{:else if query && filteredProfessors.length === 0}
						<div
							class="mt-4 rounded-box border border-base-300 bg-base-100 p-4 text-center text-gray-500"
						>
							Nenhum professor encontrado para "{query}".
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
