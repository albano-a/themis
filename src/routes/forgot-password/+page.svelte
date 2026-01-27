<script>
	import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-svelte';
	import { account } from '$lib/appwrite';
	import { goto } from '$app/navigation';

	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let error = $state('');
	let success = $state(false);

	/**
	 * Handles the forgot password form submission.
	 * @param {Event} e - The form submit event.
	 */
	async function handleReset(e) {
		e.preventDefault();
		loading = true;
		error = '';
		message = '';
		success = false;

		const resetUrl = `${window.location.origin}/reset-password`;

		try {
			await account.createRecovery({ email: email, url: resetUrl });
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

<div class="flex min-h-screen w-full items-center justify-center font-sans">
	<div class="glass-card w-full max-w-md p-8 backdrop-blur-xl">
		<div class="mb-8 text-center">
			<a href="/" class="mb-4 block text-4xl font-black tracking-tighter text-primary">Classefy</a>
			<h1 class="text-2xl font-bold text-base-content">Recuperar Senha</h1>
			<p class="mt-2 text-sm text-base-content/60">
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
			<form onsubmit={handleReset} class="space-y-4">
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
							class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
							required
							bind:value={email}
						/>
						<Mail
							class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
						/>
					</div>
				</div>

				<button
					class="btn mt-4 w-full rounded-xl text-base font-bold shadow-lg transition-all btn-lg btn-primary hover:scale-[1.02] hover:shadow-primary/25"
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-md loading-dots"></span>
					{:else}
						Enviar Link
						<ArrowRight class="h-5 w-5" />
					{/if}
				</button>
			</form>
		{/if}

		<div class="mt-8 text-center text-sm text-base-content/60">
			<a
				href="/login"
				class="flex items-center justify-center gap-2 font-bold transition-colors hover:text-primary"
			>
				<ArrowLeft class="h-4 w-4" />
				Voltar para o login
			</a>
		</div>
	</div>
</div>
