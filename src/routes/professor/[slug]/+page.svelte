<script lang="ts">
	import { tablesDB, DATABASE_ID, PROFESSORS_TABLE_ID } from '$lib/appwrite';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Query } from 'appwrite';
	import { ArrowLeft, Mail, BookOpen } from 'lucide-svelte';

	let professor = $state<any>(null);
	/** @type {boolean} */
	let loading = $state(true);
	/** @type {string} */
	let error = $state('');

	let slug = $derived($page.params.slug as string);

	onMount(async () => {
		try {
			const response = await tablesDB.listRows(DATABASE_ID, PROFESSORS_TABLE_ID, [
				Query.equal('slug', slug)
			]);
			if (response.rows.length > 0) {
				professor = response.rows[0];
			} else {
				error = 'Professor não encontrado.';
			}
		} catch (err) {
			console.error('Error fetching professor:', err);
			error = 'Erro ao carregar professor.';
		} finally {
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-base-200 font-sans">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-2xl">
			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-lg loading-spinner"></span>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<span>{error}</span>
				</div>
			{:else if professor}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center gap-4">
							<button class="btn btn-circle btn-ghost" onclick={() => history.back()}>
								<ArrowLeft class="h-5 w-5" />
							</button>
							<h2 class="card-title text-3xl font-black">Perfil do Professor</h2>
						</div>

						<div class="flex flex-col items-center gap-6">
							{#if professor.profile_picture_url}
								<img
									src={professor.profile_picture_url}
									alt={professor.name}
									class="h-32 w-32 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-content"
								>
									{professor.name.charAt(0).toUpperCase()}
								</div>
							{/if}

							<div class="text-center">
								<h3 class="text-2xl font-bold">{professor.name}</h3>
								<p class="text-lg opacity-70">{professor.course_name}</p>
								<p class="text-sm opacity-50">{professor.university_slug}</p>
							</div>

							{#if professor.prof_email}
								<div class="flex items-center gap-2">
									<Mail class="h-5 w-5" />
									<a href="mailto:{professor.prof_email}" class="link link-primary"
										>{professor.prof_email}</a
									>
								</div>
							{/if}

							<div class="divider"></div>

							<div class="w-full">
								<h4 class="mb-4 flex items-center gap-2 text-xl font-bold">
									<BookOpen class="h-5 w-5" />
									Avaliações
								</h4>
								<!-- TODO: Add ratings/reviews section -->
								<div class="text-center text-gray-500">Avaliações em breve...</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
