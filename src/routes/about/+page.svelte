<script lang="ts">
	import { GraduationCap, Users, Star, Search } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-base-200 font-sans">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-4xl">
			<!-- Hero Section -->
			<div class="hero mb-8 rounded-3xl bg-base-100 shadow-xl">
				<div class="hero-content py-12 text-center">
					<div class="max-w-2xl">
						<GraduationCap class="mx-auto mb-6 h-16 w-16 text-primary" />
						<h1 class="mb-4 text-5xl font-black text-primary">Sobre o Classefy</h1>
						<p class="text-xl leading-relaxed opacity-80">
							Plataforma desenvolvida para ajudar estudantes universitários a encontrarem e
							avaliarem professores, facilitando a escolha das melhores disciplinas.
						</p>
					</div>
				</div>
			</div>

			<!-- Mission Section -->
			<div class="card mb-8 bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-6 card-title text-3xl font-black">Nossa Missão</h2>
					<p class="mb-6 text-lg leading-relaxed">
						Sabemos como é importante escolher os professores certos para ter uma experiência
						acadêmica positiva. A qualidade do ensino, o método de avaliação e a didática fazem toda
						a diferença no aprendizado.
					</p>
					<p class="text-lg leading-relaxed">
						O Classefy foi criado para conectar estudantes e compartilhar experiências reais sobre
						professores. Nossa plataforma permite que você pesquise, avalie e descubra informações
						valiosas sobre docentes, ajudando outros estudantes a fazerem escolhas mais conscientes.
					</p>
				</div>
			</div>

			<!-- Features Grid -->
			<div class="mb-8 grid gap-6 md:grid-cols-2">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center gap-4">
							<div class="rounded-full bg-primary/10 p-3">
								<Search class="h-8 w-8 text-primary" />
							</div>
							<h3 class="card-title text-xl">Busca Inteligente</h3>
						</div>
						<p class="opacity-80">
							Encontre professores rapidamente por nome, departamento ou disciplina com nossa busca
							otimizada.
						</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center gap-4">
							<div class="rounded-full bg-primary/10 p-3">
								<Users class="h-8 w-8 text-primary" />
							</div>
							<h3 class="card-title text-xl">Avaliações de Professores</h3>
						</div>
						<p class="opacity-80">
							Acesse avaliações e comentários de outros estudantes sobre professores e disciplinas
							para fazer escolhas mais informadas.
						</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center gap-4">
							<div class="rounded-full bg-primary/10 p-3">
								<Star class="h-8 w-8 text-primary" />
							</div>
							<h3 class="card-title text-xl">Interface Intuitiva</h3>
						</div>
						<p class="opacity-80">
							Design moderno e responsivo que funciona perfeitamente em desktop e dispositivos
							móveis.
						</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="mb-4 flex items-center gap-4">
							<div class="rounded-full bg-primary/10 p-3">
								<GraduationCap class="h-8 w-8 text-primary" />
							</div>
							<h3 class="card-title text-xl">Comunidade Acadêmica</h3>
						</div>
						<p class="opacity-80">
							Faça parte de uma comunidade que valoriza a transparência e a melhoria da qualidade do
							ensino superior.
						</p>
					</div>
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
