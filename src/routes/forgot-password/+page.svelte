<script>
	import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-svelte';
	import { account } from '$lib/appwrite';
	import { goto } from '$app/navigation';

	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let error = $state('');
	let success = $state(false);

	async function handleReset(e) {
		e.preventDefault();
		loading = true;
		error = '';
		message = '';
		success = false;

		try {
			await account.createRecovery({ email: email, url: 'http://localhost:5173/reset-password' });
			success = true;
			message = 'Um email de recuperação foi enviado. Verifique sua caixa de entrada.';
		} catch (err) {
			console.error(err);
			error = 'Não foi possível enviar o email de recuperação. Verifique o email informado.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen w-full bg-base-100 font-sans">
	<!-- Left Side: Visual/Branding (Hidden on mobile) -->
	<div
		class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral p-12 text-neutral-content lg:flex"
	>
		<!-- Abstract Background Pattern -->
		<div class="absolute inset-0 z-0 opacity-20">
			<svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<path d="M0 100 L100 0 L100 100 Z" fill="url(#grad3)" />
				<defs>
					<linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:currentColor;stop-opacity:1" />
						<stop offset="100%" style="stop-color:currentColor;stop-opacity:0" />
					</linearGradient>
				</defs>
			</svg>
		</div>

		<div class="relative z-10">
			<a href="/" class="text-3xl font-black tracking-tighter">Classefy</a>
		</div>

		<div class="relative z-10 max-w-md">
			<h2 class="mb-6 text-5xl leading-tight font-bold">Recupere seu acesso.</h2>
			<p class="text-lg opacity-80">
				Não se preocupe, acontece com todo mundo. Vamos te ajudar a voltar para a plataforma num
				instante.
			</p>
		</div>

		<div class="relative z-10 text-sm opacity-60">
			&copy; {new Date().getFullYear()} Classefy. Feito por estudantes.
		</div>
	</div>

	<!-- Right Side: Form -->
	<div class="flex w-full flex-col justify-center bg-base-100 p-8 lg:w-1/2 lg:p-24">
		<div class="mx-auto w-full max-w-md">
			<div class="mb-10">
				<h1 class="text-4xl font-black text-base-content">Esqueceu a senha?</h1>
				<p class="mt-3 text-base-content/60">
					Digite seu email para receber um link de recuperação.
				</p>
			</div>

			{#if error}
				<div
					role="alert"
					class="mb-6 flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error"
				>
					<AlertCircle class="h-5 w-5 shrink-0" />
					<span>{error}</span>
				</div>
			{/if}

			{#if success}
				<div
					role="alert"
					class="mb-6 flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success"
				>
					<CheckCircle class="h-5 w-5 shrink-0" />
					<span>{message}</span>
				</div>
			{/if}

			{#if !success}
				<form onsubmit={handleReset} class="space-y-6">
					<!-- Email -->
					<div class="form-control">
						<label class="label pl-1" for="email">
							<span class="label-text font-bold text-base-content/70">Email</span>
						</label>
						<div class="relative">
							<input
								id="email"
								type="email"
								placeholder="seu@email.com"
								class="input-bordered input input-lg w-full bg-base-200/50 pl-11 text-sm transition-all focus:bg-base-100 focus:ring-4 focus:ring-primary/10"
								required
								bind:value={email}
							/>
							<Mail
								class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
							/>
						</div>
					</div>

					<button
						class="btn w-full rounded-xl text-base font-bold shadow-lg transition-all btn-lg btn-primary hover:scale-[1.02] hover:shadow-primary/25"
						disabled={loading}
					>
						{#if loading}
							<span class="loading loading-md loading-dots"></span>
						{:else}
							Enviar link de recuperação
							<ArrowRight class="h-5 w-5" />
						{/if}
					</button>
				</form>
			{/if}

			<div class="mt-8 text-center text-sm text-base-content/60">
				<a
					href="/login"
					class="flex items-center justify-center gap-2 font-bold text-base-content/80 transition-colors hover:text-primary"
				>
					<ArrowLeft class="h-4 w-4" />
					Voltar para o login
				</a>
			</div>
		</div>
	</div>
</div>
