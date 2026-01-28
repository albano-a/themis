<script>
	import './layout.css';
	import favicon from '$lib/assets/correct.png';
	import Navbar from '$lib/components/Navbar.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { page } from '$app/stores';
	let { children } = $props();
	injectAnalytics();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Classefy - Avaliações de Professores</title>

	<meta
		name="description"
		content="Descubra avaliações reais de professores. Saiba quem ensina bem e evite surpresas nas matérias."
	/>
	<meta name="keywords" content="professores, avaliações, universidade, cursos, educação" />
	<meta property="og:title" content="Classefy - Avaliações de Professores" />
	<meta
		property="og:description"
		content="Descubra avaliações reais de professores. Saiba quem ensina bem e evite surpresas nas matérias."
	/>
	<meta property="og:image" content="https://classefy.vercel.app/screenshot.png" />
	<meta property="og:url" content="https://classefy.vercel.app" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Classefy - Avaliações de Professores" />
	<meta
		name="twitter:description"
		content="Descubra avaliações reais de professores. Saiba quem ensina bem e evite surpresas nas matérias."
	/>
	<meta name="twitter:image" content="https://classefy.vercel.app/screenshot.png" />
</svelte:head>

<div class="mx-auto">
	{#if $page.url.pathname !== '/register' && $page.url.pathname !== '/login' && $page.url.pathname !== '/forgot-password' && !$page.url.pathname.startsWith('/reset-password')}
		<Navbar />
	{/if}
	{@render children()}
</div>
