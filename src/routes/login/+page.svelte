<script>
	import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-svelte';
	import { account } from '$lib/appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { userStore } from '$lib/stores/userStore';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	onMount(async () => {
		try {
			const user = await account.get();
			userStore.set(user);
			await goto('/profile');
		} catch {
			// User not logged in, stay on login page
		}
	});

	/**
	 * Handles the login form submission.
	 * @param {Event} e - The form submit event.
	 */
	async function login(e) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await account.createEmailPasswordSession({ email: email, password: password });
			const user = await account.get();
			userStore.set(user);
			await goto('/profile');
		} catch (err) {
			console.error(err);
			error = 'Email ou senha incorretos.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center p-4 font-sans">
	<div class="glass-card w-full max-w-md p-8 backdrop-blur-xl">
		<div class="mb-8 text-center">
			<a href="/" class="mb-4 block text-4xl font-black tracking-tighter text-primary">Classefy</a>
			<h1 class="text-2xl font-bold text-base-content">Bem-vindo de volta!</h1>
			<p class="mt-2 text-sm text-base-content/60">
				Entre para continuar avaliando.
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

		<form onsubmit={login} class="space-y-4">
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
						class="input input-lg glass-input w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={email}
					/>
					<Mail
						class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
			</div>

			<!-- Password -->
			<div class="form-control">
				<label class="label pl-1" for="password">
					<span class="label-text font-bold text-base-content/70">Senha</span>
				</label>
				<div class="relative">
					<input
						id="password"
						type="password"
						placeholder="••••••••"
						class="input input-lg glass-input w-full pl-11 text-sm transition-all focus:bg-white/60 focus:ring-4 focus:ring-primary/10"
						required
						bind:value={password}
					/>
					<Lock
						class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40"
					/>
				</div>
				<label class="label pb-0" for="password">
					<a
						href="/forgot-password"
						class="label-text-alt ml-auto text-sm font-semibold link-primary hover:underline"
					>
						Esqueceu a senha?
					</a>
				</label>
			</div>

			<button
				class="btn btn-lg btn-primary mt-4 w-full rounded-xl text-base font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-primary/25"
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-dots loading-md"></span>
				{:else}
					Entrar
					<ArrowRight class="h-5 w-5" />
				{/if}
			</button>
		</form>

		<div class="mt-8 text-center text-sm text-base-content/60">
			Não tem uma conta?
			<a href="/register" class="link link-primary font-bold hover:underline"> Criar conta </a>
		</div>
	</div>
</div>
