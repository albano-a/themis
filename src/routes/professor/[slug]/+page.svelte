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

<div class="min-h-screen font-sans">
	<div class="container mx-auto px-4 py-12">
		<div class="mx-auto max-w-3xl">
			{#if loading}
				<div class="flex h-64 items-center justify-center">
					<span class="loading loading-lg loading-dots text-primary"></span>
				</div>
			{:else if error}
				<div role="alert" class="glass-card alert border-error/30 bg-error/10 text-error">
					<AlertCircle class="h-6 w-6" />
					<span>{error}</span>
				</div>
			{:else if professor}
				<div class="glass-card mb-8 w-full p-8 backdrop-blur-xl">
					<div class="mb-8 flex items-center justify-between">
						<button
							class="glass-btn btn btn-circle text-base-content btn-sm hover:bg-white/40"
							onclick={() => history.back()}
						>
							<ArrowLeft class="h-5 w-5" />
						</button>
						<h2 class="text-xs font-bold tracking-widest uppercase opacity-50">Perfil Docente</h2>
						<div class="w-8"></div>
						<!-- Spacer to center title if needed or keep balanced -->
					</div>

					<div class="flex flex-col items-center gap-6">
						<!-- Profile Picture with Ring -->
						<div class="avatar">
							<div class="w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
								{#if professor.profile_picture_url}
									<img src={professor.profile_picture_url} alt={professor.name} />
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-white"
									>
										{professor.name.charAt(0).toUpperCase()}
									</div>
								{/if}
							</div>
						</div>

						<div class="text-center">
							<h1 class="mb-1 text-3xl font-black text-base-content">{professor.name}</h1>
							<p class="text-lg font-medium text-base-content/70">{professor.course_name}</p>
							<p class="text-sm tracking-wide uppercase opacity-50">{professor.university_slug}</p>

							<div class="mt-4 flex flex-col items-center gap-2">
								<div class="rating-lg rating rating-half">
									{#each Array(10) as _, i}
										<input
											type="radio"
											name="rating-display"
											class={`mask bg-orange-400 mask-star-2 ${i % 2 === 0 ? 'mask-half-1' : 'mask-half-2'}`}
											checked={normalizeRating(averageRating()) * 2 === i + 1}
											disabled
										/>
									{/each}
								</div>
								<div
									class="badge gap-2 border-none glass bg-white/20 px-4 py-3 font-bold text-base-content"
								>
									<Star class="h-4 w-4 fill-current" />
									{averageRating() > 0 ? averageRating() : 'N/A'}
									<span class="text-xs font-normal opacity-70">
										({reviews.length} avaliaç{reviews.length !== 1 ? 'ões' : 'ão'})
									</span>
								</div>
							</div>
						</div>

						{#if professor.prof_email}
							<div
								class="glass-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm text-base-content/80"
							>
								<Mail class="h-4 w-4" />
								<a href="mailto:{professor.prof_email}" class="hover:underline"
									>{professor.prof_email}</a
								>
							</div>
						{/if}

						<div class="mt-4">
							{#if user}
								{#if !userReview}
									<button
										class="btn rounded-full px-8 shadow-lg shadow-primary/20 transition-all btn-primary hover:scale-105"
										onclick={() => (showReviewModal = true)}
									>
										<Plus class="h-5 w-5" />
										Avaliar Agora
									</button>
								{:else}
									<div
										class="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-bold text-success"
									>
										<span>✓ Você já avaliou este professor</span>
									</div>
								{/if}
							{:else}
								<a href="/login" class="btn rounded-full px-8 btn-outline"> Entre para avaliar </a>
							{/if}
						</div>
					</div>
				</div>

				<!-- Reviews Section -->
				<div class="mt-12">
					<h3 class="mb-6 flex items-center gap-3 text-2xl font-bold text-base-content">
						<BookOpen class="h-6 w-6 text-primary" />
						Avaliações da Comunidade
					</h3>

					{#if reviews.length === 0}
						<div
							class="glass-card flex flex-col items-center justify-center p-12 text-center opacity-70"
						>
							<div class="mb-4 rounded-full bg-base-content/5 p-6">
								<BookOpen class="h-12 w-12 opacity-30" />
							</div>
							<p class="text-lg font-medium">Nenhuma avaliação ainda.</p>
							<p class="text-sm">Seja a primeira pessoa a compartilhar sua experiência!</p>
						</div>
					{:else}
						<div class="grid gap-6">
							{#each reviews as review}
								<div
									class="glass-card border border-white/40 bg-white/40 p-6 transition-all hover:bg-white/60"
								>
									<div class="flex items-start gap-4">
										<Avatar
											name={review.reviewer?.name ?? 'Anônimo'}
											src={review.reviewer?.avatarUrl ?? null}
											size="w-12 h-12"
											textSize="text-lg"
										/>

										<div class="flex-1">
											<div class="flex flex-wrap items-center justify-between gap-2">
												<div>
													<h4 class="font-bold text-base-content">
														{review.reviewer?.name ?? 'Anônimo'}
													</h4>
													<p class="text-xs text-base-content/50">
														{new Date(review.$createdAt).toLocaleDateString('pt-BR', {
															day: 'numeric',
															month: 'long',
															year: 'numeric'
														})}
													</p>
												</div>
												<div class="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-1">
													<span class="font-black text-orange-500">{review.rating}</span>
													<Star class="h-4 w-4 fill-orange-500 text-orange-500" />
												</div>
											</div>

											{#if review.comment}
												<p class="mt-3 leading-relaxed text-base-content/80">
													"{review.comment}"
												</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Review Modal -->
{#if showReviewModal}
	<dialog class="modal modal-bottom backdrop-blur-sm sm:modal-middle" open>
		<div class="glass-card modal-box border border-white/20 p-8 shadow-2xl">
			<form method="dialog">
				<button
					class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
					onclick={() => (showReviewModal = false)}>✕</button
				>
			</form>

			<h3 class="mb-6 text-center text-2xl font-black">Sua Avaliação</h3>

			<div class="flex flex-col gap-6">
				<!-- Rating Input -->
				<div class="flex flex-col items-center gap-2">
					<span class="text-sm font-bold tracking-wide uppercase opacity-50">Nota</span>
					<div class="rating-lg rating">
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
					<span class="text-xl font-bold text-orange-500">{reviewRating}/10</span>
				</div>

				<!-- Comment Input -->
				<div class="form-control">
					<label class="label" for="comment">
						<span class="label-text font-bold">Comentário (opcional)</span>
					</label>
					<textarea
						id="comment"
						class="glass-input textarea w-full resize-none textarea-lg leading-relaxed placeholder:opacity-50 focus:bg-white/60"
						placeholder="Conte como foi sua experiência com este professor... (Didática, cobrança, provas, etc.)"
						rows="4"
						maxlength="1000"
						bind:value={reviewComment}
					></textarea>
					<div class="label">
						<span class="label-text-alt ml-auto opacity-50">{reviewComment.length}/1000</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 pt-2">
					<button
						class="glass-btn btn flex-1 border-0 hover:bg-white/40"
						onclick={() => (showReviewModal = false)}
						disabled={submittingReview}
					>
						Cancelar
					</button>
					<button
						class="btn flex-1 shadow-lg shadow-primary/20 btn-primary"
						onclick={submitReview}
						disabled={submittingReview}
					>
						{#if submittingReview}
							<span class="loading loading-dots"></span>
						{:else}
							Publicar
						{/if}
					</button>
				</div>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={() => (showReviewModal = false)}>close</button>
		</form>
	</dialog>
{/if}
