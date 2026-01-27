<script lang="ts">
	import { GraduationCap, Users, Star, Search } from 'lucide-svelte';
</script>

<div class="min-h-screen font-sans">
	<div class="container mx-auto px-4 py-12">
		<div class="mx-auto max-w-4xl">
			<!-- Hero Section -->
			<div class="glass-card mb-8 rounded-3xl p-12 text-center backdrop-blur-xl">
				<div class="mx-auto max-w-2xl">
					<div class="mb-6 flex justify-center">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5"
						>
							<GraduationCap class="h-10 w-10" />
						</div>
					</div>
					<h1 class="mb-6 text-5xl font-black text-base-content">Sobre o Classefy</h1>
					<p class="text-xl leading-relaxed text-base-content/70">
						Plataforma desenvolvida para ajudar estudantes universitários a encontrarem e avaliarem
						professores, facilitando a escolha das melhores disciplinas.
					</p>
				</div>
			</div>

			<!-- Mission Section -->
			<div class="glass-card mb-8 p-10 backdrop-blur-md">
				<h2 class="mb-6 text-3xl font-black text-base-content">Nossa Missão</h2>
				<p class="mb-6 text-lg leading-relaxed text-base-content/80">
					Sabemos como é importante escolher os professores certos para ter uma experiência
					acadêmica positiva. A qualidade do ensino, o método de avaliação e a didática fazem toda a
					diferença no aprendizado.
				</p>
				<p class="text-lg leading-relaxed text-base-content/80">
					O Classefy foi criado para conectar estudantes e compartilhar experiências reais sobre
					professores. Nossa plataforma permite que você pesquise, avalie e descubra informações
					valiosas sobre docentes, ajudando outros estudantes a fazerem escolhas mais conscientes.
				</p>
			</div>

			<!-- Features Grid -->
			<div class="mb-8 grid gap-6 md:grid-cols-2">
				<div class="glass-card p-8 transition-all hover:bg-white/40">
					<div class="mb-4 flex items-center gap-4">
						<div class="rounded-2xl bg-primary/10 p-3 text-primary">
							<Search class="h-8 w-8" />
						</div>
						<h3 class="text-xl font-bold">Busca Inteligente</h3>
					</div>
					<p class="text-base-content/70">
						Encontre professores rapidamente por nome, departamento ou disciplina com nossa busca
						otimizada.
					</p>
				</div>

				<div class="glass-card p-8 transition-all hover:bg-white/40">
					<div class="mb-4 flex items-center gap-4">
						<div class="rounded-2xl bg-primary/10 p-3 text-primary">
							<Users class="h-8 w-8" />
						</div>
						<h3 class="text-xl font-bold">Avaliações de Professores</h3>
					</div>
					<p class="text-base-content/70">
						Acesse avaliações e comentários de outros estudantes sobre professores e disciplinas
						para fazer escolhas mais informadas.
					</p>
				</div>

				<div class="glass-card p-8 transition-all hover:bg-white/40">
					<div class="mb-4 flex items-center gap-4">
						<div class="rounded-2xl bg-primary/10 p-3 text-primary">
							<Star class="h-8 w-8" />
						</div>
						<h3 class="text-xl font-bold">Interface Intuitiva</h3>
					</div>
					<p class="text-base-content/70">
						Design moderno e responsivo que funciona perfeitamente em desktop e dispositivos móveis.
					</p>
				</div>

				<div class="glass-card p-8 transition-all hover:bg-white/40">
					<div class="mb-4 flex items-center gap-4">
						<div class="rounded-2xl bg-primary/10 p-3 text-primary">
							<GraduationCap class="h-8 w-8" />
						</div>
						<h3 class="text-xl font-bold">Comunidade Acadêmica</h3>
					</div>
					<p class="text-base-content/70">
						Faça parte de uma comunidade que valoriza a transparência e a melhoria da qualidade do
						ensino superior.
					</p>
				</div>
			</div>

			<!-- Call to Action -->
			<div class="card bg-linear-to-r from-primary to-secondary text-primary-content shadow-xl">
				<div class="card-body py-12 text-center">
					<h2 class="mb-4 card-title justify-center text-3xl font-black">
						Pronto para Avaliar e Descobrir?
					</h2>
					<p class="mb-6 text-lg opacity-90">
						Junte-se a milhares de estudantes que já usam o Classefy para encontrar os melhores
						professores e ter uma experiência acadêmica incrível.
					</p>
					<div class="card-actions justify-center">
						<a
							href="/search"
							class="btn border-primary-content text-primary-content btn-outline btn-lg hover:bg-primary-content hover:text-primary"
						>
							Buscar Professores
						</a>
						<a href="/register" class="btn text-primary-content btn-ghost btn-lg"> Criar Conta </a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
