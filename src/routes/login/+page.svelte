<script>
	import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-svelte';
	import googleIcon from '$lib/assets/google.svg';
	import { account } from '$lib/appwrite';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { OAuthProvider } from 'appwrite';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	onMount(async () => {
		try {
			await account.get();
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
			await goto('/profile');
		} catch (err) {
			console.error(err);
			error = 'Um erro ocorreu';
		} finally {
			loading = false;
		}
	}

	async function loginWithGoogle() {
		try {
			await account.createOAuth2Token(
				OAuthProvider.Google,
				'http://localhost:5173/',
				'http://localhost:5173/login?failure=true'
			);
		} catch (err) {
			console.error(err);
			error = 'Erro ao iniciar login com Google.';
		}
	}
</script>

<div class="hero min-h-screen bg-base-200 font-sans">
	<!-- Background Accents -->
	<div
		class="absolute top-0 left-0 -mt-20 -ml-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
	></div>
	<div
		class="absolute right-0 bottom-0 -mr-20 -mb-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
	></div>

	<div class="hero-content w-full flex-col lg:flex-row-reverse">
		<div class="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
			<div class="card-body">
				<div class="text-center">
					<h1 class="text-3xl font-black">Bem-vindo!</h1>
					<p class="py-2 text-sm opacity-70">Entre para avaliar e descobrir.</p>
				</div>

				<!-- Error Message -->
				{#if error}
					<div role="alert" class="alert rounded-lg py-2 text-sm alert-error">
						<AlertCircle class="h-4 w-4" />
						<span>{error}</span>
					</div>
				{/if}

				<form class="form-control gap-3" onsubmit={login}>
					<!-- Email Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Email</span>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<Mail class="h-4 w-4 opacity-70" />
							<input
								type="email"
								class="grow"
								placeholder="seu@email.com"
								required
								bind:value={email}
							/>
						</label>
					</div>

					<!-- Password Input -->
					<div>
						<div class="label">
							<span class="label-text font-bold">Senha</span>
							<a href="/forgot-password" class="label-text-alt link link-primary link-hover"
								>Esqueceu?</a
							>
						</div>
						<label class="input-bordered input flex items-center gap-2">
							<Lock class="h-4 w-4 opacity-70" />
							<input
								type="password"
								class="grow"
								placeholder="••••••••"
								required
								bind:value={password}
							/>
						</label>
					</div>

					<!-- Submit Button -->
					<div class="form-control mt-6">
						<button class="btn rounded-full text-lg btn-primary" disabled={loading}>
							{#if loading}
								<Loader2 class="h-5 w-5 animate-spin" />
							{:else}
								Entrar
								<ArrowRight class="h-5 w-5" />
							{/if}
						</button>
					</div>
				</form>

				<div class="divider text-xs opacity-50">OU</div>

				<!-- Social Login -->
				<button class="btn rounded-full btn-outline" onclick={loginWithGoogle}>
					<img src={googleIcon} width="16" height="16" alt="google icon" />
					Entrar com Google
				</button>

				<div class="label mt-4 justify-center">
					<span class="label-text-alt"
						>Não tem uma conta? <a href="/register" class="link font-bold link-primary"
							>Criar conta</a
						></span
					>
				</div>
			</div>
		</div>
	</div>
</div>
