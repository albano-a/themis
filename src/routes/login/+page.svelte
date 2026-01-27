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

<div class="flex min-h-screen w-full bg-base-100 font-sans">
	<!-- Left Side: Visual/Branding (Hidden on mobile) -->
	<div
		class="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex"
		style="background: oklch(42% 0.2 270)"
	>
		<div class="relative z-10">
			<a href="/" class="text-3xl font-black tracking-tighter">Classefy</a>
		</div>

		<div class="relative z-10 max-w-md">
			<div class="mb-6 h-1 w-32 bg-secondary"></div>
			<h2 class="mb-6 text-5xl leading-tight font-bold">A verdade sobre suas disciplinas.</h2>
			<p class="text-lg leading-relaxed opacity-90">
				Junte-se à comunidade estudantil que transformará a forma de escolher professores.
			</p>
		</div>

		<div class="relative z-10 text-sm opacity-70">&copy; 2025 Classefy. Feito por estudantes.</div>
	</div>

	<!-- Right Side: Form -->
	<div class="flex w-full flex-col justify-center bg-base-100 p-8 lg:w-1/2 lg:p-24">
		<div class="mx-auto w-full max-w-md">
			<div class="mb-10">
				<h1 class="text-4xl font-black text-base-content">Bem-vindo de volta!</h1>
				<p class="mt-3 text-base-content/60">Preencha seus dados para acessar sua conta.</p>
			</div>

			{#if error}
				<div
					role="alert"
					class="mb-6 flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error"
				>
					<div role="alert" class="alert alert-soft alert-error">
						<span>{error}</span>
					</div>
				</div>
			{/if}

			<form onsubmit={login} class="space-y-6">
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

				<!-- Password -->
				<div class="form-control">
					<div class="label pl-1">
						<span class="label-text font-bold text-base-content/70">Senha</span>
						<a
							href="/forgot-password"
							class="label-text-alt font-bold link-primary hover:underline"
						>
							Esqueceu?
						</a>
					</div>
					<div class="relative">
						<input
							id="password"
							type="password"
							placeholder="••••••••"
							class="input-bordered input input-lg w-full bg-base-200/50 pl-11 text-sm transition-all focus:bg-base-100 focus:ring-4 focus:ring-primary/10"
							required
							bind:value={password}
						/>
						<Lock
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
						Entrar na plataforma
						<ArrowRight class="h-5 w-5" />
					{/if}
				</button>
			</form>

			<div class="mt-8 text-center text-sm text-base-content/60">
				Não tem uma conta?
				<a href="/register" class="font-bold link-primary hover:underline">
					Criar conta gratuita
				</a>
			</div>
		</div>
	</div>
</div>
