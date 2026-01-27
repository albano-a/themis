<script lang="ts">
	import {
		tablesDB,
		DATABASE_ID,
		PROFESSORS_TABLE_ID,
		REVIEWS_TABLE_ID,
		account
	} from '$lib/appwrite';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Query, ID } from 'appwrite';
	import { ArrowLeft, Mail, BookOpen, Star, Plus, Loader2 } from 'lucide-svelte';

	let professor = $state<any>(null);
	let reviews = $state<any[]>([]);
	let loading: boolean = $state(true);
	let error: string = $state('');
	let user = $state<any>(null);
	let userReview = $state<any>(null);

	// Review modal state
	let showReviewModal = $state(false);
	let reviewRating = $state(5);
	let reviewComment = $state('');
	let submittingReview = $state(false);

	let slug = $derived($page.params.slug as string);

	// Calculate average rating
	let averageRating = $derived(() => {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return Math.round((sum / reviews.length) * 10) / 10;
	});

	onMount(async () => {
		try {
			// Check if user is logged in
			try {
				user = await account.get();
			} catch {
				user = null;
			}

			// Fetch professor
			const profResponse = await tablesDB.listRows({
				databaseId: DATABASE_ID,
				tableId: PROFESSORS_TABLE_ID,
				queries: [Query.equal('slug', slug)]
			});

			if (profResponse.rows.length > 0) {
				professor = profResponse.rows[0];
				await loadReviews();
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

	async function loadReviews() {
		if (!professor) return;

		try {
			const reviewsResponse = await tablesDB.listRows({
				databaseId: DATABASE_ID,
				tableId: REVIEWS_TABLE_ID,
				queries: [Query.equal('professor', professor.$id), Query.orderDesc('$createdAt')]
			});
			reviews = reviewsResponse.rows;
			// Track whether the logged-in user already submitted a review for this professor
			userReview = user ? reviews.find((r) => r.usersId === user.$id) : null;
		} catch (err) {
			console.error('Error fetching reviews:', err);
		}
	}

	async function submitReview() {
		if (!user || !professor || !reviewComment.trim()) return;

		// prevent duplicate submissions from the same user
		if (userReview) {
			error = 'Você já avaliou este professor.';
			showReviewModal = false;
			return;
		}

		submittingReview = true;
		try {
			await tablesDB.createRow({
				databaseId: DATABASE_ID,
				tableId: REVIEWS_TABLE_ID,
				rowId: ID.unique(),
				data: {
					professor: professor.$id,
					usersId: user.$id,
					rating: reviewRating,
					comment: reviewComment.trim()
				}
			});

			// Reset form and close modal
			reviewRating = 5;
			reviewComment = '';
			showReviewModal = false;

			// Reload reviews
			await loadReviews();
		} catch (err) {
			console.error('Error submitting review:', err);
			error = 'Erro ao enviar avaliação.';
		} finally {
			submittingReview = false;
		}
	}

	function renderStars(rating: number) {
		return Array.from({ length: 5 }, (_, i) => i < rating);
	}
</script>

<div class="min-h-screen bg-base-200 font-sans">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-2xl">
			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-xl loading-dots"></span>
				</div>
			{:else if error}
				<div role="alert" class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
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
								<div class="mt-2 flex flex-col items-center justify-center gap-2">
									<div class="rating-md rating-half">
										{#each renderStars(Math.floor(averageRating())) as filled}
											<input
												type="radio"
												name="rating-11"
												class="mask bg-orange-400 mask-star-2 mask-half-1"
												checked={filled}
												disabled
											/>
										{/each}
									</div>
									<span class="text-sm opacity-70">
										{averageRating() > 0
											? `${averageRating()}/5 (${reviews.length} avaliaç${reviews.length !== 1 ? 'ões' : 'ão'})`
											: 'Sem avaliações'}
									</span>
								</div>
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

							{#if user}
								{#if !userReview}
									<button
										class="btn rounded-full btn-outline btn-primary"
										onclick={() => (showReviewModal = true)}
									>
										<Plus class="h-4 w-4" />
										Avaliar Professor
									</button>
								{:else}
									<div class="alert alert-info">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											class="h-6 w-6 shrink-0 stroke-current"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											></path>
										</svg>
										<span>Você já avaliou este professor</span>
									</div>
								{/if}
							{:else}
								<div class="alert alert-info">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path></svg
									>
									<span
										><a href="/login" class="link link-primary">Entre</a> para avaliar este professor</span
									>
								</div>
							{/if}
							<div class="divider"></div>

							<div class="w-full">
								<h4 class="mb-4 flex items-center gap-2 text-xl font-bold">
									<BookOpen class="h-5 w-5" />
									Avaliações ({reviews.length})
								</h4>

								{#if reviews.length === 0}
									<div class="py-8 text-center text-gray-500">
										<BookOpen class="mx-auto mb-4 h-12 w-12 opacity-50" />
										<p>Este professor ainda não tem avaliações.</p>
										<p class="text-sm">Seja o primeiro a avaliar!</p>
									</div>
								{:else}
									<div class="space-y-4">
										{#each reviews as review}
											<div class="card border border-base-300 bg-base-200/50">
												<div class="card-body p-4">
													<div class="flex items-start justify-between">
														<div class="flex items-center gap-3">
															<div class="placeholder avatar">
																<div
																	class="bg-neutral-focus h-8 w-8 rounded-full text-neutral-content"
																>
																	<span class="text-xs">U</span>
																</div>
															</div>
															<div>
																<div class="rating-xs rating">
																	{#each renderStars(review.rating) as filled}
																		<input
																			type="radio"
																			name="review-rating-{review.$id}"
																			class="mask bg-orange-400 mask-star-2"
																			checked={filled}
																			disabled
																		/>
																	{/each}
																</div>
																<div class="text-xs opacity-60">
																	{new Date(review.$createdAt).toLocaleDateString('pt-BR')}
																</div>
															</div>
														</div>
													</div>
													{#if review.comment}
														<p class="mt-3 text-sm leading-relaxed">{review.comment}</p>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Review Modal -->
{#if showReviewModal}
	<div class="modal-open modal">
		<div class="modal-box max-w-md">
			<h3 class="mb-4 text-lg font-bold">Avaliar Professor</h3>

			<div class="form-control">
				<div class="label">
					<span class="label-text font-bold">Sua avaliação</span>
				</div>
				<div class="rating-lg rating-half gap-1">
					{#each Array(5) as _, i}
						<input
							type="radio"
							name="review-rating"
							class="mask bg-orange-400 mask-star-2"
							bind:group={reviewRating}
							value={i + 1}
						/>
					{/each}
				</div>
				<div class="mt-1 text-sm opacity-60">
					{reviewRating} estrela{reviewRating !== 1 ? 's' : ''} de 5
				</div>
			</div>

			<div class="form-control mt-4">
				<div class="label">
					<span class="label-text font-bold">Comentário (opcional)</span>
					<span class="label-text-alt">{reviewComment.length}/1000</span>
				</div>
				<textarea
					class="textarea-bordered textarea h-24 resize-none"
					placeholder="Compartilhe sua experiência com este professor..."
					maxlength="1000"
					bind:value={reviewComment}
				></textarea>
			</div>

			<div class="modal-action">
				<button
					class="btn btn-ghost"
					onclick={() => (showReviewModal = false)}
					disabled={submittingReview}
				>
					Cancelar
				</button>
				<button
					class="btn btn-primary"
					onclick={submitReview}
					disabled={submittingReview || !reviewComment.trim()}
				>
					{#if submittingReview}
						<span class="loading loading-lg loading-dots"></span>
						Enviando...
					{:else}
						Enviar Avaliação
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
