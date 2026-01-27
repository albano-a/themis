<script lang="ts">
	import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-svelte';
	import { account } from '$lib/appwrite';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	let userId = $state('');
	let secret = $state('');

	onMount(() => {
		userId = $page.url.searchParams.get('userId') || '';
		secret = $page.url.searchParams.get('secret') || '';

		if (!userId || !secret) {
			error = 'Link de recuperação inválido ou expirado.';
		}
	});

	async function handleResetPassword(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		if (password !== confirmPassword) {
			error = 'As senhas não coincidem.';
			loading = false;
			return;
		}

		if (password.length < 8) {
			error = 'A senha deve ter pelo menos 8 caracteres.';
			loading = false;
			return;
		}

		try {
			await account.updateRecovery({ userId: userId, secret: secret, password: password });
			success = true;
			setTimeout(() => {
				goto('/login');
			}, 3000);
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Erro ao redefinir a senha. O link pode ter expirado.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center font-sans">
	<div class="glass-card w-full max-w-md p-8 backdrop-blur-xl">
		<div class="mb-8 text-center">
			<a href="/" class="mb-4 block text-4xl font-black tracking-tighter text-primary">Classefy</a>
			<h1 class="text-2xl font-bold text-base-content">Nova Senha</h1>
			<p class="mt-2 text-sm text-base-content/60">Defina uma nova senha para sua conta.</p>
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
				<span>Senha redefinida com sucesso! Redirecionando...</span>
			</div>
		{/if}

		<form onsubmit={handleResetPassword} class="space-y-4">
			<!-- Password -->
			<div class="form-control">
				<label class="label pl-1" for="password">
					<span class="label-text font-bold text-base-content/70">Nova Senha</span>
				</label>
				<div class="relative">
					<input
						id="password"
						type="password"
						placeholder="••••••••"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={password}
						disabled={success || !!error}
					/>
					<Lock
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<!-- Confirm Password -->
			<div class="form-control">
				<label class="label pl-1" for="confirmPassword">
					<span class="label-text font-bold text-base-content/70">Confirmar Senha</span>
				</label>
				<div class="relative">
					<input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						class="glass-input input input-lg w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={confirmPassword}
						disabled={success || !!error}
					/>
					<Lock
						class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<button
				class="btn mt-4 w-full rounded-xl text-base font-bold shadow-lg transition-all btn-lg btn-primary hover:scale-[1.02] hover:shadow-primary/25"
				disabled={loading || success || !!error}
			>
				{#if loading}
					<span class="loading loading-md loading-dots"></span>
				{:else}
					Redefinir Senha
					<ArrowRight class="h-5 w-5" />
				{/if}
			</button>
		</form>
	</div>
</div>
