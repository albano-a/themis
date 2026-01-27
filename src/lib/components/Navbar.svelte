<script>
	import favicon from '../assets/correct.png';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<nav class="flex items-center justify-between py-4">
	<div class="flex items-center gap-3">
		<img src={favicon} alt="Classefy Logo" class="h-10 w-10 rounded-full shadow" />
		<h1 class="text-3xl font-extrabold tracking-wide text-[#6fa8b5] uppercase drop-shadow">
			Classefy
		</h1>
	</div>
	<div class="flex gap-8 font-medium">
		<a href="/" class=" text-gray-700 transition-colors duration-200 hover:text-[#6fa8b5]">Home</a>
		<a href="/about" class=" text-gray-700 transition-colors duration-200 hover:text-[#6fa8b5]"
			>About</a
		>
		<Button href="/login" variant="outline" size="lg" class="" disabled={false}>Login</Button>
	</div>
</nav>
