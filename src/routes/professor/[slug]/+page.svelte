<script lang="ts">
	import {
		tablesDB,
		DATABASE_ID,
		PROFESSORS_TABLE_ID,
		REVIEWS_TABLE_ID,
		account,
		USERS_TABLE_ID,
		storage,
		BUCKET_ID
	} from '$lib/appwrite';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Query, ID } from 'appwrite';
	import { ArrowLeft, Mail, BookOpen, Star, Plus, Loader2 } from 'lucide-svelte';
	import { getInitials } from '$lib/utils';
	import Avatar from '$lib/components/Avatar.svelte';

	let professor = $state<any>(null);
	let reviews = $state<any[]>([]);
	let loading: boolean = $state(true);
	let error: string = $state('');
	let user = $state<any>(null);
	let userReview = $state<any>(null);
	let currentUserRowId = $state<string | null>(null);
	const maxStars = 10;

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

	// Function to normalize a 1-10 rating to a 1-5 scale
	function normalizeRating(rating: number): number {
		return Math.round((rating / 10) * 5 * 2) / 2; // Round to nearest 0.5
	}

	onMount(async () => {
		try {
			// Check if user is logged in
			try {
				user = await account.get();
			} catch {
				user = null;
			}

			const professorsResponse = await tablesDB.listRows({
				databaseId: DATABASE_ID,
				tableId: PROFESSORS_TABLE_ID,
				queries: [Query.equal('slug', slug)]
			});

			if (professorsResponse.rows && professorsResponse.rows.length > 0) {
				professor = professorsResponse.rows[0];
			} else {
				error = 'Professor not found.';
			}

			await loadReviews();
		} catch (err) {
			console.error('Error fetching professor:', err);
			error = 'Erro ao buscar professor.';
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

			reviews.forEach((review) => {
				// Fetch the user from the usersId stored in the review
				(async () => {
					try {
						const usersResponse = await tablesDB.getRow({
							databaseId: DATABASE_ID,
							tableId: USERS_TABLE_ID,
							rowId: review.usersId
						});
						if (usersResponse) {
							// Attach reviewer info to the review
							review.reviewer = {
								name: usersResponse.name,
								avatarUrl: usersResponse.avatarId
									? storage.getFileView({ bucketId: BUCKET_ID, fileId: usersResponse.avatarId })
									: null
							};
						}
					} catch (err) {
						console.error('Error fetching reviewer for review', review.$id, err);
					}
				})();
			});

			console.log('Fetched reviews:', reviews);
		} catch (err) {
			console.error('Error fetching reviews:', err);
		}
	}

	async function submitReview() {
		if (!user || !professor) return;

		submittingReview = true;

		try {
			// Ensure we have the users table row id for this user
			let usersIdForReview = currentUserRowId;
			if (!usersIdForReview) {
				const rows = await tablesDB.listRows({
					databaseId: DATABASE_ID,
					tableId: USERS_TABLE_ID,
					queries: [Query.equal('userId', user.$id)],
					total: false
				});
				if (rows.rows && rows.rows.length > 0) {
					usersIdForReview = rows.rows[0].$id;
					currentUserRowId = usersIdForReview;
				} else {
					console.error(
						'Expected users table row for authenticated user not found (userId=' + user.$id + ')'
					);
					error = 'Conta de usuário não encontrada.';
					submittingReview = false;
					return;
				}
			}

			// prevent duplicate submissions (check by users table row $id)
			if (reviews.some((r) => r.usersId === usersIdForReview)) {
				error = 'Você já avaliou este professor.';
				showReviewModal = false;
				return;
			}

			await tablesDB.createRow({
				databaseId: DATABASE_ID,
				tableId: REVIEWS_TABLE_ID,
				rowId: ID.unique(),
				data: {
					professor: professor.$id,
					usersId: usersIdForReview, // store users table row $id here
					rating: reviewRating,
					comment: reviewComment.trim() || null
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
									<div class="rating-xl rating">
										{#each Array(5) as _, i}
											<input
												type="radio"
												name="rating-display"
												class="mask bg-orange-400 mask-star-2"
												checked={normalizeRating(averageRating()) > i}
												disabled
											/>
										{/each}
									</div>
									<span class="text-sm opacity-70">
										{averageRating() > 0
											? `${averageRating()}/10 (${reviews.length} avaliaç${reviews.length !== 1 ? 'ões' : 'ão'})`
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
									<div class="py-12 text-center text-base-content/50">
										<BookOpen class="mx-auto mb-4 h-16 w-16 opacity-20" />
										<p class="text-lg font-medium">Este professor ainda não tem avaliações.</p>
										<p class="text-sm">Seja o primeiro a avaliar!</p>
									</div>
								{:else}
									<div class="grid gap-4">
										{#each reviews as review}
											<div
												class="card bg-base-100 shadow-sm ring-1 ring-base-200 transition-shadow hover:shadow-md"
											>
												<div class="card-body gap-4 p-5">
													<!-- Review Header -->
													<div class="flex items-start justify-between gap-4">
														<div class="flex items-center gap-3">
															<Avatar
																name={review.reviewer?.name ?? 'Estudante'}
																src={review.reviewer?.avatarUrl ?? null}
																size="w-10 h-10"
																textSize="text-xs"
															/>
															<div>
																<div class="text-sm font-bold">
																	{review.reviewer?.name ?? 'Estudante'}
																</div>
																<div class="text-xs text-base-content/50">
																	{new Date(review.$createdAt).toLocaleDateString('pt-BR', {
																		day: '2-digit',
																		month: 'long',
																		year: 'numeric'
																	})}
																</div>
															</div>
														</div>

														<!-- Star Rating Display -->
														<div class="flex items-center gap-2">
															<span class="text-lg font-bold text-primary/80">{review.rating}</span>
															<div class="rating-sm pointer-events-none rating rating-half">
																{#each Array(10) as _, i}
																	<input
																		type="radio"
																		name="rating-read-only-{review.$id}"
																		class={`mask bg-orange-400 mask-star-2 ${i % 2 === 0 ? 'mask-half-1' : 'mask-half-2'}`}
																		checked={normalizeRating(review.rating) * 2 === i + 1}
																		disabled
																	/>
																{/each}
															</div>
														</div>
													</div>

													<!-- Review Content -->
													{#if review.comment}
														<div class="pl-13">
															<!-- Indent to align with text, not avatar -->
															<p class="text-sm leading-relaxed text-base-content/80">
																{review.comment}
															</p>
														</div>
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
	<dialog class="modal modal-bottom sm:modal-middle" open>
		<div class="modal-box w-full max-w-lg">
			<h3 class="mb-4 text-center text-lg font-bold">Avaliar Professor</h3>

			<div class="form-control items-center text-center">
				<div class="label">
					<span class="label-text font-bold">Sua avaliação</span>
				</div>
				<div class="rating-lg rating mt-2 justify-center gap-1">
					{#each Array(maxStars) as _, i}
						<input
							type="radio"
							name="review-rating"
							class="mask bg-orange-400 mask-star-2"
							bind:group={reviewRating}
							value={i + 1}
						/>
					{/each}
				</div>
			</div>

			<div class="form-control mt-4">
				<div class="label justify-center">
					<span class="label-text font-bold">Comentário (opcional)</span>
					<span class="label-text-alt">{reviewComment.length}/1000</span>
				</div>
				<textarea
					class="textarea-bordered textarea h-24 w-full resize-none"
					placeholder="Compartilhe sua experiência com este professor..."
					maxlength="1000"
					bind:value={reviewComment}
				></textarea>
			</div>

			<div class="modal-action justify-center">
				<button
					class="btn btn-ghost"
					onclick={() => (showReviewModal = false)}
					disabled={submittingReview}
				>
					Cancelar
				</button>
				<button class="btn btn-primary" onclick={submitReview} disabled={submittingReview}>
					{#if submittingReview}
						<span class="loading loading-lg loading-dots"></span>
						Enviando...
					{:else}
						Enviar Avaliação
					{/if}
				</button>
			</div>
		</div>
	</dialog>
{/if}
