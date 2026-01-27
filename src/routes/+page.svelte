<script>
	import { goto } from '$app/navigation';
	import { Search, Star, Shield, Zap, ArrowRight, GraduationCap } from 'lucide-svelte';
</script>

<div class="min-h-screen font-sans text-base-content">
	<!-- Hero Section -->
	<section class="relative hero mt-8 min-h-[80vh] overflow-hidden">
		<!-- Background accents can stay as additional flair, but maybe adjust opacity -->
		<div
			class="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-primary/30 blur-3xl"
		></div>
		<div class="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-secondary/30 blur-3xl"></div>

		<div class="hero-content z-10 text-center">
			<div class="max-w-4xl">
				<div
					class="mb-8 badge gap-2 border-primary/20 glass p-4 text-sm font-bold tracking-widest text-primary uppercase"
				>
					<span class="relative flex h-3 w-3">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
						></span>
						<span class="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
					</span>
					A nova era das avaliações
				</div>

				<h1
					class="mb-8 text-5xl leading-tight font-black text-base-content md:text-7xl lg:text-8xl"
				>
					A verdade sobre <br class="hidden md:block" />
					<span
						class="filter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm"
					>
						seus professores.
					</span>
				</h1>

				<p class="mb-10 text-xl font-medium text-base-content/80 drop-shadow-sm lg:text-2xl">
					Chega de surpresas na hora da inscrição nas matérias. Descubra quem ensina bem, quem passa
					trabalho demais e quem vai salvar o seu semestre.
				</p>

				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<button
						class="btn gap-3 rounded-full border-none shadow-lg transition-transform btn-lg btn-primary hover:scale-105 hover:bg-primary/90"
						onclick={() => goto('/search')}
					>
						<Search class="h-5 w-5" />
						Buscar Professor
					</button>
					<button
						class="btn gap-3 rounded-full glass text-base-content transition-transform btn-lg hover:scale-105 hover:bg-white/40"
						onclick={() => goto('/about')}
					>
						Como funciona
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Bento Grid / Features -->
	<section class="container mx-auto px-4 py-24">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Card 1 -->
			<div
				class="glass-card card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
			>
				<div class="card-body">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 text-warning"
					>
						<Star class="h-6 w-6" />
					</div>
					<h2 class="card-title text-2xl font-bold">Avaliações Sem Filtro</h2>
					<p class="text-lg text-base-content/70">
						Opiniões reais de quem realmente cursou a matéria. Nada de censura, apenas a verdade
						para você decidir.
					</p>
				</div>
			</div>

			<!-- Card 2 (Wide) -->
			<div
				class="bg-opacity-90 card relative overflow-hidden bg-primary text-primary-content shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:col-span-2"
			>
				<div
					class="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"
				></div>
				<div
					class="relative z-10 card-body flex-col justify-between gap-8 md:flex-row md:items-center"
				>
					<div class="flex-1">
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
							<GraduationCap class="h-6 w-6 text-white" />
						</div>
						<h2 class="mb-2 card-title text-3xl font-black">Feito para Estudantes</h2>
						<p class="text-lg text-primary-content/90">
							A plataforma definitiva para você montar a grade perfeita e evitar provas finais.
							Construída pela comunidade, para a comunidade.
						</p>
					</div>
					<button
						class="btn rounded-full border-none shadow-lg btn-lg btn-secondary hover:bg-white hover:text-primary"
						onclick={() => goto('/register')}
					>
						Criar conta grátis
						<ArrowRight class="ml-2 h-5 w-5" />
					</button>
				</div>
			</div>

			<!-- Card 3 -->
			<div
				class="glass-card card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
			>
				<div class="card-body">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 text-success"
					>
						<Shield class="h-6 w-6" />
					</div>
					<h2 class="card-title text-2xl font-bold">100% Anônimo</h2>
					<p class="text-lg text-base-content/70">
						Sua privacidade é nossa prioridade. Avalie professores e matérias sem medo de ser
						identificado.
					</p>
				</div>
			</div>

			<!-- Card 4 (Wide) -->
			<div
				class="glass-card card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:col-span-2"
			>
				<div class="card-body">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error/20 text-error"
					>
						<Zap class="h-6 w-6" />
					</div>
					<h2 class="card-title text-2xl font-bold">Rápido, Direto e Eficiente</h2>
					<p class="max-w-2xl text-lg text-base-content/70">
						Sem enrolação. Encontre o professor, veja a nota e decida. Use nossa busca inteligente
						para filtrar por departamento, matéria ou nome do professor em segundos.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
